const Koa = require('koa')
const logger = require('koa-morgan')
const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { User } = require('./db')

const server = new Koa()

const { v4: uuidv4 } = require('uuid')

const { Record } = require('./db')

router
    .post("/auth", bodyParser, async ctx => {
        let pass_is_true = true
        /*
        тут надо проверить правильность пароля (кода из смс), который передается в ctx.request.body['code'],
        если он неверный, то pass_is_true = false
        */
        if(pass_is_true) {
            const token = uuidv4()
            await User
                .findOrCreate({ where: { phone: ctx.request.body['phone'] } })
                .then(([user]) => {
                    User.update({ user_id: token }, { where: { id: user.id } })
                })
            ctx.body = {
                status: 201,
                token: token
            }
        } else {
            ctx.body = { status: 401 }
        }
    })
    .del("/auth/:token", bodyParser, async ctx => {
        await User
            .update({ user_id: null }, { where: { user_id: ctx.params["token"] } })
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
            )
            
    })
    .get("/user/:id", bodyParser, async ctx => {
        ctx.body = await User.findOne({ where: {user_id : ctx.params["id"]} })
    })
    .put("/user/:id", bodyParser, async ctx => {
        console.log(ctx.request.body["afd"])
        new_data = {
            name: ctx.request.body["name"],
            last_name: ctx.request.body["last_name"],
            middle_name: ctx.request.body["middle_name"],
            //мне кажется телефон изменять не нужно (может даже нельзя)
            //phone: ctx.request.body["phone"],
            email: ctx.request.body["email"],
            avatar: ctx.request.body["avatar"],
            //пока без машины, ее нужно допилить позже
            /*car: {
                name: “Ford Focus”,
                year: 2020,
                photo: "http://img.blabla.com/234u823tuiof",
            },*/
            bio: ctx.request.body["bio"],
            review: ctx.request.body["review"],
        }
        await User
            .update(new_data, { where: {user_id: ctx.params["id"]} })
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
            )
    })
    .post('/', bodyParser, ctx => {
        User.create({
            name: ctx.request.body['name'],
            phone: ctx.request.body['phone']
        })
        ctx.body = ctx.request.body
    })
    .get('/', async ctx => {
        ctx.body = await User.findAll()
    })

server
    .use(logger('tiny'))
    .use(router.routes())
    .listen(8080)
console.log("server is starting...")