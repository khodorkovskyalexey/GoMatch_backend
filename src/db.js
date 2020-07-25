const { Sequelize, Model, DataTypes } = require('sequelize')

const db = new Sequelize('postgres://xylbrwhd:jnXlIHXaBK0Xg_ufSomLyjygf7Muo7fv@arjuna.db.elephantsql.com:5432/xylbrwhd')

const User = db.define('user', {
    user_id: Sequelize.UUID,
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

db.sync()

module.exports = {
    db,
    User,
}
