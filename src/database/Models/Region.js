const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const Region = sequelize.define('region', {
    name: Sequelize.STRING,
})

module.exports = Region