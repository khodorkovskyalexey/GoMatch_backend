const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { Region } = require('../db')

router.get("/region", async ctx => {
	ctx.body = await Region.findAll()
})

module.exports = router