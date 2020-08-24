const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { v5: uuidv5 } = require('uuid')

const { User, Car, Carpool, Request } = require('../db')

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
                        match_time: ctx.request.body["match_time"]
                    }
                })
                .then(([carpool]) => {
                    const id = uuidv5(ctx.params["token"] + ctx.request.body["match_time"], process.env.TOKEN_NAMESPACE)
                    const carpool_data = {
                        carpool_id: id,
                        visitor_team_name: ctx.request.body["visitor_team_name"],
                        visitor_team_logo: ctx.request.body["visitor_team_logo"],
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
        ctx.body = await Carpool.findAll()
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
        ctx.body = await Carpool.findOne({ where: {carpool_id : ctx.params["id"]} })
    })
    .post("/:token/carpools/:id/passengers/:user_id", bodyParser, async ctx => {
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] }, attributes: ["owner", "seats_total"] })
        if(carpool_data["owner"] == ctx.params["token"]) {
            await Request.count({ where: {approved: true } }).then(len => {
                if(len < carpool_data["seats_total"]) {
                    Request.update({ approved: true }, { where: { user_id: ctx.params["user_id"] } })
                    ctx.body = { status: 200 }
                } else {
                    ctx.body = { status: 405 }
                }
            })
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
            const tokens = await Request.findAll({ where: { approved: true }, attributes: ["user_id"] })
            var res = { passengers: [] }
            var i = 0
            for (const user of tokens) {
                res.passengers[i] = await User.findOne({ where: { token: user["user_id"] }, attributes: ["name", "phone", "review"] })
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
            var res = await Request.findAll({ where: { approved: false } })
            res.status = 200
            ctx.body = res
        } else {
            ctx.body = { status: 403 }
        }
    })
    .post("/carpools/:id/requests/:user_id", bodyParser, async ctx => {
        await Request
            .findOrCreate({ where: {
                    user_id: ctx.params["user_id"],
                    carpool_id: ctx.params["id"]
                }
            })
            .then(([request]) => {
                if(request.approved == null) {
                    Request.update({ approved: false }, { where: { id: request.id } })
                }
            })
    })

module.exports = router