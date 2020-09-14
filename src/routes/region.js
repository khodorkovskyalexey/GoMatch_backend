const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { Region, Area } = require('../db')

router.get("/region", async ctx => {
	ctx.body = await Region.findAll({ attributes: ["name"] })
})

router.post("/region", bodyParser, async ctx => {
	await Region.findOrCreate({ where: { name: ctx.request.body["name"] } })
})

router.post("/area", bodyParser, async ctx => {
	await Area.findOrCreate({ where: {
		name: ctx.request.body["name"],
		region_name: ctx.request.body["region_name"]
	} })
})

router.get("/area", async ctx => {
	ctx.body = await Area.findAll()
})

router.get("/area/:region", bodyParser, async ctx => {
	ctx.body = await Area.findAll({ where: { region_name: ctx.params["region"] },
		attributes: ["region_name", "name"] })
})

module.exports = router