const Koa = require('koa')
const logger = require('koa-morgan')
const bodyParser = require("koa-body")()
const cors = require("koa-cors")

const server = new Koa()

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const carpoolsRoutes = require("./routes/carpools")
const reviewRoutes = require("./routes/review")
const passengersRoutes = require("./routes/passengers")
const devRoutes = require("./routes/getAll")
const regionRoutes = require("./routes/region")
const matchRoutes = require("./routes/match")

const port = process.env.PORT || 8080
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
    .use(passengersRoutes.routes())
    .use(devRoutes.routes())
    .use(regionRoutes.routes())
    .use(matchRoutes.routes())
    //others
    .use(logger("tiny"))
    .use(cors())
    .listen(port, () => {
        console.log("Server listening on port: " + port)
    })