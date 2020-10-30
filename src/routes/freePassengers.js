const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { User, Passenger } = require('../database/db')

router
	.post("/:token/passengers", bodyParser, async ctx => {
		await Passenger
			.findOrCreate({ where: {
				user_id: ctx.params["token"],
				match_id: ctx.request.body["match_id"]
			} })
			.then(([passengers]) => {
				var update = {}
				if(passengers["departure_time"] != ctx.request.body["departure_time"]) {
					update["departure_time"] = ctx.request.body["departure_time"]
				}
				if(passengers["location"] != ctx.request.body["location"]) {
					update["location"] = ctx.request.body["location"]
				}
				if(update != null) {
					Passenger.update(update, { where: { id: passengers["id"] } })
				}
			})
	})
	.get("/passengers/:match_id", bodyParser, async ctx => {
		const tokens = await Passenger.findAll({ where: { match_id: ctx.params["match_id"] },
			attributes: ["user_id", "departure_time", "location"] })
		var res = []
	    var i = 0
	    for (const user of tokens) {
	        res[i] = await User.findOne({ where: { token: user["user_id"] },
	        	attributes: ["token", "name", "phone", "review", "own_region"] })
	        res[i].dataValues.departure_time = user["departure_time"]
	        res[i].dataValues.location = user["location"]
	    	i++
	    }
	    ctx.body = res
	})

module.exports = router