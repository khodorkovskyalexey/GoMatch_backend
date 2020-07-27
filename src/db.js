const { Sequelize, Model, DataTypes } = require('sequelize')

const db = new Sequelize('postgres://xylbrwhd:jnXlIHXaBK0Xg_ufSomLyjygf7Muo7fv@arjuna.db.elephantsql.com:5432/xylbrwhd')

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
    owner: Sequelize.INTEGER,
    name: Sequelize.INTEGER,
    year: Sequelize.INTEGER,
    photo: Sequelize.STRING,
})

const Carpool = db.define('carpool', {
    owner_id: Sequelize.INTEGER,
    match_id : Sequelize.INTEGER,
    location : Sequelize.STRING,
    time: Sequelize.STRING,
    seats_total : Sequelize.INTEGER,
    car_id : Sequelize.INTEGER,
    avatar : Sequelize.STRING,
})

const Request = db.define('request', {
    user_id : Sequelize.INTEGER,
    carpool_id : Sequelize.INTEGER,
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
