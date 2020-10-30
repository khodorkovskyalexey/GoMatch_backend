const { Sequelize } = require('sequelize')

const { DB_CONNECTION } = require('../configs/env')

const sequelize_conf = new Sequelize(DB_CONNECTION, { dialect: "postgres" })

module.exports = sequelize_conf