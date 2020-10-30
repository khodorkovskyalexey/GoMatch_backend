const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const User = sequelize.define('user', {
    token: Sequelize.UUID,
    name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    own_region: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
    bio: Sequelize.TEXT,
    review: { type: Sequelize.REAL, defaultValue: 0 },
    counter_trip: { type: Sequelize.INTEGER, defaultValue: 0 },
})

module.exports = User