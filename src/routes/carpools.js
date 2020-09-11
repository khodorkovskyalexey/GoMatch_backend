//OLD VERSION
/*
const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { v5: uuidv5 } = require('uuid')

const { User, Car, Carpool, Request } = require('../db')

require('dotenv').config()

router
    .post("/:token/carpools", bodyParser, async ctx => {
        const car = await Car.findOne({ where: { owner: ctx.params["token"] }, attributes: ["name"] })
        if(car["name"] == null) {
            ctx.body = {
                status: 403,
                carpool_id: null
            }
        } else {
            await Carpool
                .findOrCreate({ where: {
                        owner: ctx.params["token"],
                        match_id: ctx.request.body["match_id"]
                    }
                })
                .then(([carpool]) => {
                    const id = uuidv5(ctx.params["token"] + ctx.request.body["match_time"], 
                        process.env.TOKEN_NAMESPACE)
                    const carpool_data = {
                        carpool_id: id,
                        departure_time: ctx.request.body["departure_time"],
                        match_id: ctx.request.body["match_id"],
                        own_region: ctx.request.body["own_region"],
                        location: ctx.request.body["location"],
                        seats_total: ctx.request.body["seats_total"]
                    }
                    Carpool.update(carpool_data, { where: { id: carpool.id } })
                    ctx.body = {
                        status: 201,
                        carpool_id: id
                    }
                })
        }
        
    })
    .get("/carpools", async ctx => {
        let res = await Carpool.findAll({ attributes:
            ["carpool_id", "location", "seats_total", "owner", "departure_time", "own_region", "match_id"] })
        var i = 0
            for (const carpool of res) {
                res[i]["owner"] = await User.findOne({ where: { token: carpool["owner"] },
                    attributes: ["name", "last_name", "review", "phone"] })
                i++
            }
        ctx.body = res
    })
    .del("/:token/carpools/:id", bodyParser, async ctx => {
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] }, attributes: ["owner"] })
        if(carpool_data["owner"] == ctx.params["token"]) {
            await Carpool.destroy({ where: { carpool_id: ctx.params["id"] } })
            ctx.body = { status: 200 }
        } else {
            ctx.body = { status: 403 }
        }
    })
    .get("/carpools/:id", bodyParser, async ctx => {
        let res = await Carpool.findOne({ where: {carpool_id : ctx.params["id"]},
            attributes: ["location", "seats_total", "owner", "departure_time", "own_region"] })
        res["owner"] = await User.findOne({ where: { token: res["owner"] },
            attributes: ["name", "last_name", "review"] })
        ctx.body = res
    })
    .post("/:token/carpools/:id/passengers/:user_id", bodyParser, async ctx => {
        const carpool_owner 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] },
                attributes: ["owner", "seats_total"] })
        if(carpool_carpool_owner["owner"] == ctx.params["token"]) {
            const counts = await Request.findAll({ where: {
                carpool_id: ctx.params["id"],
                approved: true
            }, attributes: ["count"] }) 
            let len = 0
            for (const i of counts) {
                len += i["count"]
            }
            const count_data = await Request.findOne({ where: {
                carpool_id: ctx.params["id"],
                user_id: ctx.params["user_id"]
            }, attributes: ["count"] })
            if(len <= carpool_data["seats_total"] - count_data["count"]) {
                await Request.update({ approved: true }, { where: { user_id: ctx.params["user_id"] } })
                ctx.body = { status: 200 }
            } else {
                ctx.body = { status: 405 }
            }
        } else {
            ctx.body = { status: 403 }
        }
    })
    .del("/:token/carpools/:id/passengers/:user_id", bodyParser, async ctx => {
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] }, attributes: ["owner"] })
        if(carpool_data["owner"] == ctx.params["token"]) {
            await Request.destroy({ where: {
                    user_id: ctx.params["user_id"],
                    carpool_id: ctx.params["id"]
                } 
            })
            ctx.body = { status: 200 }
        } else {
            ctx.body = { status: 403 }
        }
    })
    .get("/:token/carpools/:id/passengers", bodyParser, async ctx => {
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] }, attributes: ["owner"] })
        if(carpool_data["owner"] == ctx.params["token"]) {
            const tokens = await Request.findAll({ where: { approved: true },
                attributes: ["user_id", "count"] })
            var res = { passengers: [] }
            var i = 0
            for (const user of tokens) {
                res.passengers[i].count = user["count"]
                res.passengers[i] = await User.findOne({ where: { token: user["user_id"] },
                    attributes: ["name", "phone", "review"] })
                i++
            }
            res.status = 200
            ctx.body = res
        } else {
            ctx.body = { status: 403 }
        }
    })
    .get("/:token/carpools/:id/requests", bodyParser, async ctx => {
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] }, attributes: ["owner"] })
        if(carpool_data["owner"] == ctx.params["token"]) {
            var res = await Request.findAll({ where: {
                approved: false,
                carpool_id: ctx.params["id"]
            } })
            res.status = 200
            ctx.body = res
        } else {
            ctx.body = { status: 403 }
        }
    })
    .post("/carpools/:id/requests/:user_id", bodyParser, async ctx => {
        const carpool_data = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] },
            attributes: ["seats_total"] })
        const counts = await Request.findAll({ where: {
            carpool_id: ctx.params["id"],
            approved: true
        }, attributes: ["count"] })
        let len = 0
        for (const i of counts) {
            len += i["count"]
        }
        let passengers_count = ctx.request.body["count"]
        if(passengers_count == null) {
            passengers_count = 1
        }
        if(len <= carpool_data["seats_total"] - passengers_count) {
            await Request
                .findOrCreate({ where: {
                    user_id: ctx.params["user_id"],
                    carpool_id: ctx.params["id"]
                } })
                .then(([request]) => {
                    if(ctx.request.body["count"] > 1) {
                        Request.update({ count: passengers_count },
                            { where: { id: request.id } })
                    }
                    if(request.approved == null) {
                        Request.update({ approved: false }, { where: { id: request.id } })
                    }
                })
            ctx.body = { status: 200 }
        } else {
            ctx.body = { status: 405 }
        }
    })

module.exports = router
*/