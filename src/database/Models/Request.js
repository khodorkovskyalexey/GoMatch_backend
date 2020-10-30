const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const Request = sequelize.define('request', {
    request_id : Sequelize.UUID,
    user_id : Sequelize.UUID,
    carpool_id : Sequelize.UUID,
    count: { type: Sequelize.INTEGER, defaultValue: 1 },
    approved: { type: Sequelize.BOOLEAN, defaultValue: false },
    cancelled: { type: Sequelize.BOOLEAN, defaultValue: false },
    author_role: Sequelize.STRING, // "passenger", "driver"
})

module.exports = Request