const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const Car = sequelize.define('car', {
    owner: Sequelize.UUID,
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
})

module.exports = Car