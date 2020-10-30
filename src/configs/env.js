require('dotenv').config()

module.exports = {
    TOKEN_NAMESPACE: process.env.TOKEN_NAMESPACE,
    DB_CONNECTION: process.env.DB_CONN,
    DELTA_MINUTES_FOR_DEADLINE: process.env.DELTA_MINUTES_FOR_DEADLINE,
}