const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { User, Car, Request } = require('../db')

router
    .get("/requests", async ctx => {
        ctx.body = await Request.findAll()
    })
    .get("/user", async ctx => {
        ctx.body = await User.findAll()
    })
    .get("/car", async ctx => {
        ctx.body = await Car.findAll()
    })

module.exports = router