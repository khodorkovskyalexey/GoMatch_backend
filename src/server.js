const Koa = require('koa')
const logger = require('koa-morgan')
const router = require('koa-router')()
const bodyParser = require("koa-body")()
const cors = require("cors")
const { Op } = require('sequelize')
const { User, Car, Carpool, Request } = require('./db')

const server = new Koa()

const { v5: uuidv5 } = require('uuid')

const { Record } = require('./db')

const namespace = "2e0150d0-89a6-4dbf-a567-a9cdb1c14754"

router
    .post("/auth", bodyParser, async ctx => {
        const token = uuidv5(ctx.request.body["phone"], namespace)
        await User
            .findOrCreate({ where: { phone: ctx.request.body['phone'] } })
            .then(([user]) => {
                if(token != user.token) {
                    User.update({ token: token }, { where: { token: user.token } })
                }
            })
        await Car
            .findOrCreate({ where: { owner: token } })
        ctx.body = {
            status: 201,
            token: token
        }
    })
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
                    const id = uuidv5(ctx.params["token"] + ctx.request.body["match_time"], namespace)
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
    .get("/requests", async ctx => {
        ctx.body = await Request.findAll()
    })
    .get("/user", async ctx => {
        ctx.body = await User.findAll()
    })
    .get("/car", async ctx => {
        ctx.body = await Car.findAll()
    })

const port = process.env.PORT || 8080

server
    .use(logger("tiny"))
    .use(router.routes())
    .use(cors())
    .listen(port)

console.log("server is starting...")