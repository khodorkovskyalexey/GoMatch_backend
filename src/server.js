const Koa = require('koa')
const logger = require('koa-morgan')
const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { User, Car } = require('./db')

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
                token: ""
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
    .post('/', bodyParser, async ctx => {
        ctx.body = await User.findOne({ where: {token : ctx.request.body["token"]} })
    })
    .get('/', async ctx => {
        ctx.body = await User.findAll()
    })

server
    .use(logger('tiny'))
    .use(router.routes())
    .listen(8080)
console.log("server is starting...")