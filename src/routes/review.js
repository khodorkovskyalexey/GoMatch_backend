const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { User } = require('../database/db')

router
	.post("/review/:user_id", bodyParser, async ctx => {
		const data = await User.findOne({ where: {token : ctx.params["user_id"]},
            attributes: ["review", "counter_trip"] })
		const newData = {
			review:
				(data["review"] * data["counter_trip"] + ctx.request.body["rate"]) / (data["counter_trip"] + 1),
			counter_trip: data["counter_trip"] + 1
		}
		await User.update(newData, { where: {token: ctx.params["user_id"]} })
		console.log(data["review"] + " => " + newData["review"])
	})

module.exports = router