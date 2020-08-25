const router = require('koa-router')()
const bodyParser = require("koa-body")()
const { Match } = require('../db')

router
    .get("/matches", async ctx => {
    	ctx.body = await Match.findAll({ attributes: ["id", "time", "visitor_team_name", "visitor_team_logo"] })
    })

module.exports = router