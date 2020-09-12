const Koa = require('koa')
const logger = require('koa-morgan')
const bodyParser = require("koa-body")()
const cors = require("koa-cors")

const router = require('koa-router')()

const server = new Koa()

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
//const carpoolsRoutes = require("./routes/carpools")
const newcarpoolsRoutes = require("./routes/newcarpools")
const reviewRoutes = require("./routes/review")
const freePassengersRoutes = require("./routes/freePassengers")
const devRoutes = require("./routes/getAll")
const regionRoutes = require("./routes/region")
const matchRoutes = require("./routes/match")

server
    .use(async (ctx, next) => {
        ctx.set("Access-Control-Allow-Origin", "*")
        ctx.set(
            "Access-Control-Allow-Headers",
            "Origin, X-Requested-With, Content-Type, Accept"
        )
        ctx.set("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
        await next()
    })
    //routes
    .use(authRoutes.routes())
    .use(userRoutes.routes())
//    .use(carpoolsRoutes.routes())
    .use(newcarpoolsRoutes.routes())
    .use(reviewRoutes.routes())
    .use(freePassengersRoutes.routes())
    .use(devRoutes.routes())
    .use(regionRoutes.routes())
    .use(matchRoutes.routes())
    .use(router.routes())
    //others
    .use(logger("dev"))
    .use(cors())




 

const http_server = require('http').createServer(server.callback())

var conn = {}

const { User, Car, Carpool, Request } = require('./db')

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
            attributes: ["seats_total"] })
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
        }

        if(req["role"] == 1) {
            const user = await User.findOne({ where: { token: req["user_id"] }, attributes: ["name"] })
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
        } else if(req["role"] == 2) {
            const carpool_owner_token = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                attributes: ["owner"] })
            const user = await User.findOne({ where: { token: carpool_owner_token["owner"] },
                attributes: ["name"] })
            if(conn[req["user_id"]] != null) {
                io.sockets.in(conn[req["user_id"]]).emit("request", {
                    peoples: passengers_count,
                    carpool_id: req["carpool_id"],
                    user: user,
                    role: req["role"]
                })
            }
        }
    })
/*
    client.on("response", async req => {
        var status = req["status"]
        if(status == 1) {
            const request_data = await Request.findOne({ where: {
                carpool_id: req["carpool_id"],
                user_id: req["user_id"]
            }, attributes: ["count", "author_role"] })

            var access = true
            if(request_data["author_role"] == 1) {
                const carpool_owner_token = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                attributes: ["owner"] })
                if(carpool_owner_token["owner"] != req["token"]) {
                    access = false
                    status = 0
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
                const carpool_data = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                        attributes: ["seats_total"] })
                if(len <= carpool_data["seats_total"] - request_data["count"]) {
                    await Request.update({ approved: true }, { where: { user_id: req["user_id"] } })
                }
            }

        } else if(status == 2) {
            await Request.destroy({ where: {
                    user_id: req["user_id"],
                    carpool_id: req["carpool_id"]
                } 
            })
        }

        const role = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
            attributes: ["author_role"] })
        if(role["author_role"] == 1) {
            const carpool_owner_token = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                attributes: ["owner"] })
            const user = await User.findOne({ where: { token: carpool_owner_token["owner"] },
                attributes: ["name"] })
            if(conn[req["user_id"]] != null) {
                io.sockets.in(conn[req["user_id"]]).emit("request", {
                    status: status,
                    carpool_id: req["carpool_id"],
                    user: user,
                    role: role["author_role"]
                })
            }
        } else if(req["role"] == 2) {
            const user = await User.findOne({ where: { token: req["user_id"] }, attributes: ["name"] })
            const carpool_owner_token = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                attributes: ["owner"] })
            if(conn[carpool_owner_token["owner"]] != null) {
                io.sockets.in(conn[carpool_owner_token["owner"]]).emit("request", {
                    status: status,
                    carpool_id: req["carpool_id"],
                    user: user,
                    role: req["role"]
                })
            }
        }
    })*/

    client.on("test", req => {
        if(conn[req["user_id"]] != null) {
            io.sockets.in(conn[req["user_id"]]).emit("test", req["test"])
        }
    })
})

router
    .get("/conn", ctx => {
        ctx.body = conn
    })

const port = process.env.PORT || 8080
http_server
    .listen(port, () => {
        console.log("Server listening on port: " + port)
    })