const Koa = require('koa')
const logger = require('koa-morgan')
const router = require('koa-router')()
const bodyParser = require("koa-body")()
const cors = require("koa-cors")

const server = new Koa()

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const carpoolsRoutes = require("./routes/carpools")
const devRoutes = require("./routes/getAll")

server
    .use(authRoutes.routes())
    .use(userRoutes.routes())
    .use(carpoolsRoutes.routes())
    .use(devRoutes.routes())

const port = process.env.PORT || 8080

server
    .use(logger("tiny"))
    .use(router.routes())
    .use(cors())
    .listen(port, () => {
        console.log("Server listening on port: ${PORT}")
    })