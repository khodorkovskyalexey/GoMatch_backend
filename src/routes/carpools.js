const router = require('koa-router')()
const bodyParser = require("koa-body")()

const { v5: uuidv5 } = require('uuid')

const { User, Car, Carpool } = require('../database/db')

require('dotenv').config()

router
    .post("/:token/carpools", bodyParser, async ctx => {
        const car = await Car.findOne({ where: { owner: ctx.params["token"] },
            attributes: ["name"] })
        if(car["name"] == null) {
            ctx.body = {
                status: 403,
                carpool_id: null
            }
        } else {
            await Carpool
                .findOrCreate({ where: {
                        owner: ctx.params["token"],
                        match_id: ctx.request.body["match_id"]
                    }
                })
                .then(([carpool]) => {
                    const id = uuidv5(ctx.params["token"] + ctx.request.body["match_id"], 
                        process.env.TOKEN_NAMESPACE)
                    const carpool_data = {
                        carpool_id: id,
                        departure_time: ctx.request.body["departure_time"],
                        match_id: ctx.request.body["match_id"],
                        own_region: ctx.request.body["own_region"],
                        location: ctx.request.body["location"],
                        seats_total: ctx.request.body["seats_total"]
                    }
                    Carpool.update(carpool_data, { where: { id: carpool.id } })
                    ctx.body = {
                        status: 201,
                        carpool_id: id
                    }
                })
        }
        
    })
    .get("/carpools", async ctx => {
        let res = await Carpool.findAll({ attributes:
            ["carpool_id", "location", "seats_total", "owner", "departure_time", "own_region", "match_id"]
        })
        var i = 0
        for (const carpool of res) {
            res[i]["owner"] = await User.findOne({ where: { token: carpool["owner"] },
                attributes: ["name", "last_name", "review", "phone"] })
            i++
        }
        ctx.body = res
    })
    .get("/carpools/:match_id", async ctx => {
        let all_carpools = await Carpool.findAll({ where: { match_id: ctx.params["match_id"] },
            attributes: ["carpool_id", "location", "seats_total",
                "owner", "departure_time", "own_region", "match_id"]
        })
        let res = []
        let res_i = 0
        let i = 0
        const time_now = new Date()
        for (const carpool of all_carpools) {
            let deadline = new Date(all_carpools[i]["departure_time"])
            deadline.setMinutes(deadline.getMinutes() + 20)
            if(time_now < deadline) {
                const owner = carpool["owner"]
                res[res_i] = all_carpools[i]
                const car = await Car.findOne({ where: { owner: owner },
                    attributes: ["name", "year"]})
                res[res_i]["owner"] = await User.findOne({ where: { token: owner },
                    attributes: ["name", "last_name", "review", "phone"] })
                res[res_i].dataValues.car = car
                res_i++
            }
            i++
        }
        ctx.body = res
    })
    .del("/:token/carpools/:carpool_id", bodyParser, async ctx => {
        const carpool_data 
            = await Carpool.findOne({ where: { carpool_id: ctx.params["carpool_id"] },
                attributes: ["owner"] })
        if(carpool_data["owner"] === ctx.params["token"]) {
            await Carpool.destroy({ where: { carpool_id: ctx.params["carpool_id"] } })
            ctx.body = { status: 200 }
        } else {
            ctx.body = { status: 403 }
        }
    })

module.exports = router