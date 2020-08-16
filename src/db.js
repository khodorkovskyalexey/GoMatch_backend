const { Sequelize, Model, DataTypes } = require('sequelize')
require('dotenv').config()

const db = new Sequelize(process.env.DB_CONN)

const User = db.define('user', {
    token: Sequelize.UUID,
    name: Sequelize.STRING,
    last_name: Sequelize.STRING,
    middle_name: Sequelize.STRING,
    phone: Sequelize.STRING,
    email: Sequelize.STRING,
    avatar: Sequelize.STRING,
    bio: Sequelize.TEXT,
    review: Sequelize.REAL,
    counter_trip: Sequelize.INTEGER,
})

const Car = db.define('car', {
    owner: Sequelize.UUID,
    name: Sequelize.STRING,
    year: Sequelize.STRING,
    photo: Sequelize.STRING,
})

const Carpool = db.define('carpool', {
    carpool_id: Sequelize.UUID,
    owner: Sequelize.UUID,
    match_time: Sequelize.DATE,
    visitor_team_name: Sequelize.STRING,
    visitor_team_logo: Sequelize.STRING,
    location : Sequelize.STRING,
    seats_total : Sequelize.INTEGER,
})

const Request = db.define('request', {
    user_id : Sequelize.UUID,
    carpool_id : Sequelize.UUID,
    approved: Sequelize.BOOLEAN,
})

db.sync()

module.exports = {
    db,
    User,
    Car,
    Carpool,
    Request,
}
