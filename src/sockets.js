const { User, Car, Carpool, Request, Passenger } = require('./db')
const { v5: uuidv5 } = require('uuid')
require('dotenv').config()

var conn = {}

var io = require('socket.io')

function feedback(client, message) {
    client.emit("feedback", message)
}

function sendMessage(token, message) {
    if(conn[token] != null) {
        console.log("ok")
        io.sockets.in(conn[token]).emit("message", message)
    } else console.log(token)
}

module.exports = function (http_server) {
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
            let carpool_data = {}
            let success = true
            let description = ""
            let request_token = ""
            let req_peoples = req["peoples"]
            let req_user_role = req["role"]
            let req_carpool_id = req["carpool_id"]
            let req_user_data = {}
            let req_recipient = ""
            //проверяем, все ли данные пришли с фронта
            if(req["role"] == null) {
                success = false
                description = "role == null"
            }
            if(req["carpool_id"] == null) {
                success = false
                description = "carpool_id == null"
            }
            if(req["user_id"] == null) {
                success = false
                description = "user_id == null"
            }
            if((req["role"] !== "passenger")&&(req["role"] !== "driver")) {
                success = false
                description = "(req[\"role\"] !== \"passenger\")&&(req[\"role\"] !== \"driver\")"
            }
            //если все пришло
            if(success) {
                //проверка на наличие свободных мест в карпуле
                carpool_data = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
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
                    description = "len + req[\"peoples\"] > carpool_data[\"seats_total\"]"
                }
                //если места есть
                if(success) {
                    //если запрос отправил водитель, то проверяем, является ли он владельцем карпула
                    if(req["role"] === "driver") {
                        for (const token in conn) {
                            if(conn[token] === client.id) {
                                if(token !== carpool_data["owner"]) {
                                    success = false
                                    description = "token !== carpool_data[\"owner\"]"
                                }
                            }
                        }
                    }
                    //проверяем актуальность карпула
                    //(если время отправления прошло, то запрос не добавляем)
                    const time_now = new Date()
                    let deadline = new Date(carpool_data["departure_time"])
                    deadline.setMinutes(deadline.getMinutes() +
                        parseInt(process.env.DELTA_MINUTES_FOR_DEADLINE))
                    if(time_now >= deadline) {
                        success = false
                        description = "time_now >= deadline"
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
                                    console.log("тут вылетает")
                                    description = "request.cancelled === true"
                                }
                                //проверяем
                                if(success) {
                                    let update = {}
                                    if(request.request_id === null) {
                                        request_token = uuidv5(req["user_id"] + req["carpool_id"],
                                            process.env.TOKEN_NAMESPACE)
                                        update["request_id"] = request_token
                                    } else {
                                        request_token = request.request_id
                                    }
                                    if(req["peoples"] > 1) {
                                        update["count"] = req["peoples"]
                                    }
                                    if(request.author_role !== req["role"]) {
                                        update["author_role"] = req["role"]
                                    }
                                    Request.update(update,
                                        { where: { id: request.id } })
                                }
                            })
                    }
                }
            }
            if(success) {
                if(req["role"] === "passenger") {
                    req_recipient = carpool_data["owner"]
                    req_user_data = await User.findOne({ where: { token: req["user_id"] },
                        attributes: ["name", "last_name", "own_region", "bio", "review"]})
                }
                if(req["role"] === "driver") {
                    req_recipient = req["user_id"]
                    req_user_data = await User.findOne({ where: { token: carpool_data["owner"] },
                        attributes: ["name", "last_name", "own_region", "bio", "review"]})
                    req_user_data.dataValues.car = await Car.findOne(
                        { where: {owner: carpool_data["owner"]},
                            attributes: ["name", "year"] })
                }
                sendMessage(req_recipient,
                    { req_user_data, req_carpool_id,
                        req_peoples, req_user_role })
            }
            feedback(client, { success, request_token, description, socket: "add_request" })
            console.log(success)
        })
    })
}