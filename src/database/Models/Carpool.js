const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const Carpool = sequelize.define('carpool', {
    carpool_id: Sequelize.UUID,
    owner: Sequelize.UUID,
    departure_time: Sequelize.DATE,
    match_id: Sequelize.INTEGER,
    own_region: Sequelize.STRING,
    location : Sequelize.STRING,
    seats_total : Sequelize.INTEGER,
})

module.exports = Carpool