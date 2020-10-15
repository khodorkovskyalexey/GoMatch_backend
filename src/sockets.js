const { User, Car, Carpool, Request, Passenger } = require('./db')

var conn = {}

var io = require('socket.io')

function feedback(client, message) {
    client.emit("feedback", message)
}

function sendMessaage(token, message) {
    if(conn[token] != null) {
        console.log("ok")
        io.sockets.in(conn[token]).emit("message", message)
    } else console.log(token)
}

module.exports = function (http_server) {
    require('dotenv').config()
    io = io(http_server)
    io.on('connect', client => {
        console.log("new connection: " + client.id)

        client.on("disconnect", () => {
            for (const token in conn) {
                if(conn[token] === client.id) {
                    delete conn[token]
                    console.log("goodby: " + token)
                }
            }
        })

        client.on("auth_with_token", token => {
            conn[token] = client.id
            console.log("token: " + token)
        })

        client.on("add_request", async req => {
            let success = true
            let discription = ""
            //проверяем, все ли данные пришли с фронта
            if(req["role"] == null) {
                success = false
                discription = "role == null"
            }
            if(req["carpool_id"] == null) {
                success = false
                discription = "carpool_id == null"
            }
            if(req["user_id"] == null) {
                success = false
                discription = "user_id == null"
            }
            if((req["role"] !== "passenger")&&(req["role"] !== "driver")) {
                success = false
                discription = "(req[\"role\"] !== \"passenger\")&&(req[\"role\"] !== \"driver\")"
            }
            //если все пришло
            if(success) {
                //проверка на наличие свободных мест в карпуле
                const carpool_data = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                    attributes: ["seats_total", "owner", "departure_time"] })
                const counts = await Request.findAll({ where: {
                        carpool_id: req["carpool_id"],
                        approved: true
                    }, attributes: ["count"] })
                let len = 0
                for (const passenger of counts) {
                    len += passenger["count"]
                }
                if(len + req["peoples"] > carpool_data["seats_total"]) {
                    success = false
                    discription = "len + req[\"peoples\"] > carpool_data[\"seats_total\"]"
                }
                //если места есть
                if(success) {
                    //если запрос отправил водитель, то проверяем, является ли он владельцем карпула
                    if(req["role"] === "driver") {
                        for (const token in conn) {
                            if(conn[token] === client.id) {
                                if(token !== carpool_data["owner"]) {
                                    success = false
                                    discription = "token !== carpool_data[\"owner\"]"
                                }
                            }
                        }
                    }
                    //проверяем актуальность карпула
                    //(если время отправления прошло, то запрос не добавляем)
                    const time_now = new Date()
                    let deadline = new Date(carpool_data["departure_time"])
                    console.log(deadline.getMinutes())
                    deadline.setMinutes(deadline.getMinutes() +
                        parseInt(process.env.DELTA_MINUTES_FOR_DEADLINE))
                    console.log(deadline.getMinutes())
                    if(time_now >= deadline) {
                        success = false
                        discription = "time_now >= deadline"
                    }
                    //если все ок, доступ есть
                    if(success) {
                        //добавляем или находим в базе
                        await Request
                            .findOrCreate({ where: {
                                    carpool_id: req["carpool_id"],
                                    user_id: req["user_id"]
                                } })
                            .then(([request]) => {
                                //если раннее запрос был отменен
                                //то ничего не делаем
                                if(request.cancelled === true) {
                                    success = false
                                    discription = "request.cancelled === true"
                                }
                                //проверяем
                                if(success) {
                                    let update = {}
                                    if(req["peoples"] > 1) {
                                        update["count"] = req["peoples"]
                                    }
                                    if(request.author_role !== req["role"]) {
                                        update["author_role"] = req["role"]
                                    }
                                    Request.update(update,
                                        { where: { id: request.id } })

                                    if(req["role"] === "passenger") {
                                        sendMessaage(carpool_data["owner"],
                                            { success, msg: "пришел запрос" })
                                    }
                                    if(req["role"] === "driver") {
                                        sendMessaage(req["user_id"],
                                            { success, msg: "пришел запрос" })
                                    }
                                }
                            })
                    }
                }
            }
            feedback(client, { success, discription, socket: "add_request" })
            console.log(success)
        })
    })
}