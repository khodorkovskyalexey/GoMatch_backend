const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { v5: uuidv5 } = require('uuid')

const { User, Car } = require('../db')

require('dotenv').config()

router
	.post("/auth", bodyParser, async ctx => {
        const token = uuidv5(ctx.request.body["phone"], process.env.TOKEN_NAMESPACE)
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