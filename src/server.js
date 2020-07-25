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