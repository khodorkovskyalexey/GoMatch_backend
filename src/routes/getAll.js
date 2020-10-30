const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { User, Car, Request, Passenger } = require('../database/db')

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
    .get("/passengers", async ctx => {
        ctx.body = await Passenger.findAll()
    })

module.exports = router