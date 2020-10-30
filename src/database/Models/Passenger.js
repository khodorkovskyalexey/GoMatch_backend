const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const Passenger = sequelize.define('passenger', {
    match_id: Sequelize.INTEGER,
    user_id: Sequelize.UUID,
    departure_time: Sequelize.DATE,
    location : Sequelize.STRING,
})

module.exports = Passenger