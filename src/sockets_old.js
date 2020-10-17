const { User, Car, Carpool, Request, Passenger } = require('./db')

var conn = {}

module.exports = function (http_server) {
	const io = require('socket.io')(http_server)
	io.on('connect', client => {

	    console.log("new connection: " + client.id)

	    client.on("disconnect", () => {
	        for (const token in conn) {
	            if(conn[token] == client.id) {
	                delete conn[token]
	                console.log("goodby: " + token)
	            }
	        }
	    })

	    client.on("auth_with_token", token => {
	        conn[token] = client.id
	        console.log("token: " + token)
	    })

	    client.on("request", async req => {
	        var status = 405
	        const carpool_data = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
	            attributes: ["seats_total", "owner", "departure_time"] })
	        const counts = await Request.findAll({ where: {
	            carpool_id: req["carpool_id"],
	            approved: true
	        }, attributes: ["count"] })
	        let len = 0
	        for (const i of counts) {
	            len += i["count"]
	        }
	        let passengers_count = req["peoples"]
	        if(passengers_count == null) {
	            passengers_count = 1
	        }
	        if(len <= carpool_data["seats_total"] - passengers_count) {

	            var access = true

	            if(req["role"] == "driver") {
	                for (const token in conn) {
	                    if(conn[token] == client.id) {
	                        if(token != carpool_data["owner"]) {
	                            access = false
	                        }
	                    }
	                }
	            }

	            //проверяем актуальность карпула
	            //(если время отправления прошло, то запрос не добавляем)
	            const time_now = new Date()
	            let deadline = new Date(carpool_data["departure_time"])
            	deadline.setMinutes(deadline.getMinutes() + 20)
            	if(time_now >= deadline) {
	                access = false
	            }

	            if(access) {
	                await Request
	                    .findOrCreate({ where: {
	                        user_id: req["user_id"],
	                        carpool_id: req["carpool_id"]
	                    } })
	                    .then(([request]) => {
	                        if(passengers_count > 1) {
	                            Request.update({ count: passengers_count },
	                                { where: { id: request.id } })
	                        }
	                        if(request.author_role == null) {
	                            Request.update({ author_role: req["role"] },
	                                { where: { id: request.id } })
	                        }
	                    })
	                status = 200

	                if(req["role"] == "passenger") {
			            const user = await User.findOne({ where: { token: req["user_id"] },
			                attributes: ["name", "token"] })
			            const carpool_owner_token = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
			                attributes: ["owner"] })
			            if(conn[carpool_owner_token["owner"]] != null) {
			                io.sockets.in(conn[carpool_owner_token["owner"]]).emit("request", {
			                    peoples: passengers_count,
			                    carpool_id: req["carpool_id"],
			                    user: user,
			                    role: req["role"]
			                })
			            }
			        } else if(req["role"] == "driver") {
			            const carpool_owner_token = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
			                attributes: ["owner"] })
			            const user = await User.findOne({ where: { token: carpool_owner_token["owner"] },
			                attributes: ["name", "token"] })
			            if(conn[req["user_id"]] != null) {
			                io.sockets.in(conn[req["user_id"]]).emit("request", {
			                    peoples: passengers_count,
			                    carpool_id: req["carpool_id"],
			                    user: user,
			                    role: req["role"],
			                    status: status
			                })
			            }
			        }
			        client.emit("answer", "ok")
	            } else {
	            	client.emit("bad_req", { status })
	            }

	        }
	    })

	    client.on("response", async req => {
	        var status = req["status"]
	        const request_data = await Request.findOne({ where: {
	            carpool_id: req["carpool_id"],
	            user_id: req["user_id"]
	        }, attributes: ["count", "author_role"] })
	        var role = request_data["author_role"]
	        /*const carpool_owner_token = await Carpool.findOne({ where: {
	        	carpool_id: req["carpool_id"]}, attributes: ["owner"]
	        })*/
            const carpool_data = await Carpool.findOne({
            	where: { carpool_id: req["carpool_id"] },
            	attributes: ["owner", "seats_total", "match_id"]
            })

	        if(status == 1) {
	            var access = true
	            if(role == "passenger") {
	                for (const token in conn) {
	                    if(conn[token] == client.id) {
	                        if(token != carpool_data["owner"]) {
	                            access = false
	                            status = 400
	                        }
	                    }
	                }
	            }

	            if(role == "driver") {
	                for (const token in conn) {
	                    if(conn[token] == client.id) {
	                        if(token != req["user_id"]) {
	                            access = false
	                            status = 400
	                        }
	                    }
	                }
	            }

	            if(access) {
	                const counts = await Request.findAll({ where: {
	                    carpool_id: req["carpool_id"],
	                    approved: true
	                }, attributes: ["count"] }) 
	                let len = 0
	                for (const i of counts) {
	                    len += i["count"]
	                }
	                if(len <= carpool_data["seats_total"] - request_data["count"]) {
	                    await Request.update({ approved: true }, { where: {
                    		user_id: req["user_id"],
                    		carpool_id: req["carpool_id"]
                    	} })
                    	//удаление пассажира из списка свободных пассажиров
                    	//чтобы водители не видели его в списке и не могли кинуть запрос
                    	const passenger = await Passenger.findOne({ where: {
                    		match_id: carpool_data["match_id"],
    						user_id: req["user_id"]
                    	}, attributes: ["id"] })
                    	console.log(passenger)
                    	if(passenger != null) {
                    		await Passenger.destroy({ where: {
		                        id: passenger["id"]
		                    } })
                    	}
                	}
	            }

	        } else if(status == 2) {

	            var access = false
	            for (const token in conn) {
	                    if(conn[token] == client.id) {
	                        if(token == req["user_id"]) {
	                            access = true
	                            role = "driver"
	                        } else {
	                            if(token == carpool_data["owner"]) {
	                                access = true
	                                role = "passenger"
	                            } else {
	                                status = 400
	                            }
	                        }
	                    }
	                }

	            if(access) {
	            	await Request.update({ cancelled: true }, { where: {
                		user_id: req["user_id"],
                		carpool_id: req["carpool_id"]
                	} })
	            }
	        }

	        if(status == 400) {
	            client.emit("response", {
	                status: status
	            })
	        } else if(role == "passenger") {
	            const user = await User.findOne({ where: { token: carpool_data["owner"] },
	                attributes: ["name"] })
	            if(conn[req["user_id"]] != null) {
	                io.sockets.in(conn[req["user_id"]]).emit("response", {
	                    status: status,
	                    carpool_id: req["carpool_id"],
	                    user: user,
	                    role: role
	                })
	            }
			    client.emit("answer", "ok")
	        } else if(role == "driver") {
	            const user = await User.findOne({ where: { token: req["user_id"] },
	            	attributes: ["name"] })
	            if(conn[carpool_data["owner"]] != null) {
	                io.sockets.in(conn[carpool_data["owner"]]).emit("response", {
	                    status: status,
	                    carpool_id: req["carpool_id"],
	                    user: user,
	                    role: role
	                })
	            }
			    client.emit("answer", "ok")
	        } else {
			    client.emit("answer", "ok")
	        }
	    })
	})
}