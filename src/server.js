const Koa = require('koa')
const logger = require('koa-morgan')
const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { User, Car, Carpool, Request } = require('./db')

const server = new Koa()

const { v5: uuidv5 } = require('uuid')

const { Record } = require('./db')

const namespace = "2e0150d0-89a6-4dbf-a567-a9cdb1c14754"

router
    .post("/auth", bodyParser, async ctx => {
        let pass_is_true = true
        /*
        тут надо проверить правильность пароля (кода из смс), который передается в ctx.request.body['code'],
        если он неверный, то pass_is_true = false
        */
        if(pass_is_true) {
            const token = uuidv5(ctx.request.body['phone'], namespace)
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
        } else {
            ctx.body = {
                status: 401,
                token: null
            }
        }
    })
    .del("/auth/:token", bodyParser, async ctx => {
        console.log("delete: " + ctx.params["token"])
        /*await User
            .update({ token: null }, { where: { token: ctx.params["token"] } })
            .then(
                result => {
                    ctx.body = {
                        "status": 204,
                        "massage": "OK"
                    }
                },
                error => {
                    ctx.body = {
                        "status": 400,
                        "massage": "Error: " + error.massage
                    }
                }
            )*/
            
    })
    .get("/user/:token", bodyParser, async ctx => {
        let res = await User.findOne({ where: {token : ctx.params["token"]} })
        res.dataValues.car = await Car.findOne({ where: {owner : ctx.params["token"]} }) 
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
    .post("/carpools", bodyParser, async ctx => {
        const car = await Car.findOne({ where: { owner: ctx.request.body["owner"] }, attributes: ["name"] })
        if(car["name"] == null) {
            ctx.body = {
                status: 403,
                carpool_id: null
            }
        } else {
            await Carpool
                .findOrCreate({ where: {
                        owner: ctx.request.body["owner"],
                        match_time: ctx.request.body["match_time"]
                    }
                })
                .then(([carpool]) => {
                    const id = uuidv5(ctx.request.body['owner'] + ctx.request.body['match_time'], namespace)
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
    .get("/carpools/:id", bodyParser, async ctx => {
        ctx.body = await Carpool.findOne({ where: {carpool_id : ctx.params["id"]} })
    })
    .del("/carpools/:id", bodyParser, async ctx => {
        await Carpool.destroy({ where: { carpool_id: ctx.params["id"] } })
    })
    .get("/carpools", async ctx => {
        ctx.body = await Carpool.findAll()
    })
    .post("/carpools/:id/passengers/:user_id", bodyParser, async ctx => {
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
    .post("/carpools/:id/requests/:user_id", bodyParser, async ctx => {
        var passengers_count = 0
        await Request.count({ where: {approved: false } }).then(len => {
            passengers_count = len
        })
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["id"] }, attributes: ["seats_total"] })
        if(passengers_count < carpool_data["seats_total"]) {
            await Request.update({ approved: true }, { where: { user_id: ctx.params["user_id"] } })
            ctx.body = { status: 200 }
        } else {
            ctx.body = { status: 405 }
        }
    })
    .get("/carpools/:id/requests", bodyParser, async ctx => {
        ctx.body = await Request.findAll({ where: { approved: false } })
    })
    .post("/", bodyParser, async ctx => {
        await Carpool.findOrCreate({ where: { match_time: "2020-07-28T12:36:00.000Z" } })
    })
    .get("/", async ctx => {
        ctx.body = await Request.findAll()
    })

server
    .use(logger("tiny"))
    .use(router.routes())
    .listen(8080)
console.log("server is starting...")