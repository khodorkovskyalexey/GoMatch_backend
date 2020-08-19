const Koa = require('koa')
const logger = require('koa-morgan')
const bodyParser = require("koa-body")()
const cors = require("koa-cors")

const server = new Koa()

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const carpoolsRoutes = require("./routes/carpools")
const devRoutes = require("./routes/getAll")

const port = process.env.PORT || 8080
server
    //routes
    .use(authRoutes.routes())
    .use(userRoutes.routes())
    .use(carpoolsRoutes.routes())
    .use(devRoutes.routes())
    //others
    .use(logger("tiny"))
    .use(cors())
    .listen(port, () => {
        console.log("Server listening on port: " + port)
    })