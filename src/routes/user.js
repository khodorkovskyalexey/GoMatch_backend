const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { User, Car } = require('../db')

router
    .get("/user/:token", bodyParser, async ctx => {

        if(process.env.NODE_ENV == "dev") {
            attributes = ["name", "last_name", "own_region", "phone", "email", "bio", "review", "counter_trip"]
        } else {
            attributes = ["name", "last_name", "own_region", "phone", "email", "bio", "review"]
        }

        let res = await User.findOne({ where: {token : ctx.params["token"]},
            attributes: attributes })
        if(res != null) {
            res.dataValues.car = await Car.findOne({ where: {owner : ctx.params["token"]},
                attributes: ["name", "year"] })
            if(res["name"] == null) {
                res.dataValues.status = 204
            } else {
                res.dataValues.status = 200
            }
        } else {
            res = { status: 404 }
        }
        ctx.body = res
    })
    .post("/user/:token", bodyParser, async ctx => {
        const user_data = {
            name: ctx.request.body["name"],
            last_name: ctx.request.body["last_name"],
            own_region: ctx.request.body["own_region"],
            email: ctx.request.body["email"],
            bio: ctx.request.body["bio"],
        }
        await User.update(user_data, { where: {token: ctx.params["token"]} })

        const car = ctx.request.body["car"]
        if(car != null) {
            const car_data = {
                name: car["name"],
                year: car["year"],
            }
            await Car.update(car_data, { where: {owner: ctx.params["token"]} })
        }
    })

module.exports = router