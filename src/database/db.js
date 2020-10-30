const sequelize = require('./sequelize_conf')

const User = require('./Models/User')
const Car = require('./Models/Car')
const Carpool = require('./Models/Carpool')
const Request = require('./Models/Request')
const Passenger = require('./Models/Passenger')
const Region = require('./Models/Region')
const Area = require('./Models/Area')

sequelize.sync()

module.exports = {
    User,
    Car,
    Carpool,
    Request,
    Region,
    Passenger,
    Area,
}
