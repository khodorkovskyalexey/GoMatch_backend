const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { User, Car, Carpool, Request } = require('../db')

router
    .get("/user/:token", bodyParser, async ctx => {
        let res = await User.findOne({ where: {token : ctx.params["token"]},
            attributes: ["name", "last_name", "middle_name", "phone", "email", "avatar", "bio", "review"] })
        res.dataValues.car = await Car.findOne({ where: {owner : ctx.params["token"]},
            attributes: ["name", "year", "photo"] })
        if(res["name"] == null) {
            res.dataValues.status = 204
        } else {
            res.dataValues.status = 200
        }
        ctx.body = res
    })
    .put("/user/:token", bodyParser, async ctx => {
        const user_data = {
            name: ctx.request.body["name"],
            last_name: ctx.request.body["last_name"],
            middle_name: ctx.request.body["middle_name"],
            email: ctx.request.body["email"],
            avatar: ctx.request.body["avatar"],
            bio: ctx.request.body["bio"],
        }
        const car_data = {
            name: ctx.request.body["car"]["name"],
            year: ctx.request.body["car"]["year"],
            photo: ctx.request.body["car"]["photo"],
        }
        await User
            .update(user_data, { where: {token: ctx.params["token"]} })
        await Car
            .update(car_data, { where: {owner: ctx.params["token"]} })
    })

module.exports = router