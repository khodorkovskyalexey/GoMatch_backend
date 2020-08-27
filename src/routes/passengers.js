const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { User, Passenger } = require('../db')

router
	.post("/:token/passengers", bodyParser, async ctx => {
		await Passenger.findOrCreate({ where: {
			user_id: ctx.params["token"],
			match_id: ctx.request.body["match_id"]
		} })
	})
	.get("/passengers/:match_id", bodyParser, async ctx => {
		const tokens = await Passenger.findAll({ where: { match_id: ctx.params["match_id"] },
			attributes: ["user_id"] })
		var res = []
	    var i = 0
	    for (const user of tokens) {
	        res[i] = await User.findOne({ where: { token: user["user_id"] },
	        	attributes: ["name", "phone", "review", "own_region"] })
	    	i++
	    }
	    ctx.body = res
	})

module.exports = router