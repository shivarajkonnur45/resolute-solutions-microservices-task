require('dotenv').config();
const dbConfig = {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    DB: process.env.DB_DATABASE,
    dialect: 'mysql'
}

module.exports = dbConfig;