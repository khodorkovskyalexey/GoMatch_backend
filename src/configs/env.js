require('dotenv').config()

module.exports = {
    TOKEN_NAMESPACE: process.env.TOKEN_NAMESPACE,
    DB_CONN: process.env.DB_CONNECTION,
    DELTA_MINUTES_FOR_DEADLINE: process.env.DELTA_MINUTES_FOR_DEADLINE,
}