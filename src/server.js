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
const passengersRoutes = require("./routes/passengers")
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
    .use(passengersRoutes.routes())
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
                })
            status = 200
        }
        const user = await User.findOne({ where: { token: req["user_id"] }, attributes: ["name"] })
        if(conn[req["user_id"]] != null) {
            io.sockets.in(conn[req["user_id"]]).emit("request", {
                peoples: passengers_count,
                carpool_id: req["carpool_id"],
                user: user
            })
        }
    })

    client.on("response", async req => {
        if(req["status"] == 1) {
            const counts = await Request.findAll({ where: {
                carpool_id: req["carpool_id"],
                approved: true
            }, attributes: ["count"] }) 
            let len = 0
            for (const i of counts) {
                len += i["count"]
            }
            const count_data = await Request.findOne({ where: {
                carpool_id: req["carpool_id"],
                user_id: req["user_id"]
            }, attributes: ["count"] })
            const carpool_data = await Carpool.findOne({ where: { carpool_id: req["carpool_id"] },
                    attributes: ["seats_total"] })
            if(len <= carpool_data["seats_total"] - count_data["count"]) {
                await Request.update({ approved: true }, { where: { user_id: req["user_id"] } })
            }
        } else if(req["status"] == 2) {
            await Request.destroy({ where: {
                    user_id: req["user_id"],
                    carpool_id: req["carpool_id"]
                } 
            })
        }
        const user = await User.findOne({ where: { token: req["user_id"] }, attributes: ["name"] })
        if(conn[req["user_id"]] != null) {
            io.sockets.in(conn[req["user_id"]]).emit("response", {
                status: req["status"],
                carpool_id: req["carpool_id"],
                user: user
            })
        }
    })

    client.on("test", req => {
        if(conn[req["user_id"]] != null) {
            io.sockets.in(conn[req["user_id"]]).emit("test", req["test"])
        }
    })
})

router
    .post("/info", bodyParser, ctx => {
        const token = ctx.request.body["token"]
        const message = ctx.request.body["message"]
        if(conn[token] != null) {
            io.sockets.in(conn[token]).emit("msg", {message: message})
        }
    })
    .get("/conn", ctx => {
        ctx.body = conn
    })

const port = process.env.PORT || 8080
http_server
    .listen(port, () => {
        console.log("Server listening on port: " + port)
    })