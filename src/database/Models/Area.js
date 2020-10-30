const { Sequelize } = require('sequelize')
const sequelize = require('../sequelize_conf')

const Area = sequelize.define('area', {
    region_name: Sequelize.STRING,
    name: Sequelize.STRING,
})

module.exports = Area