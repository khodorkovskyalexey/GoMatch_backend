const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { v5: uuidv5 } = require('uuid')

const { User, Car, Carpool, Request } = require('../db')

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

module.exports = router