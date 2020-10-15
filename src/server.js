const Koa = require('koa')
const logger = require('koa-morgan')
const cors = require("koa-cors")

const server = new Koa()

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const carpoolsRoutes = require("./routes/carpools")
const reviewRoutes = require("./routes/review")
const freePassengersRoutes = require("./routes/freePassengers")
const devRoutes = require("./routes/getAll")
const regionRoutes = require("./routes/region")

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
    .use(carpoolsRoutes.routes())
    .use(reviewRoutes.routes())
    .use(freePassengersRoutes.routes())
    .use(devRoutes.routes())
    .use(regionRoutes.routes())
    //others
    .use(logger("dev"))
    .use(cors())

const http_server = require('http').createServer(server.callback())
require("./sockets")(http_server)

const port = process.env.PORT || 8080
http_server.listen(port, () => {
    console.log("Server listening on port: " + port)
})