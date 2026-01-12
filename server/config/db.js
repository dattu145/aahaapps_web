const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

console.log('DB Config:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    db: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true, // Required for executing SQL dumps
    ssl: {
        rejectUnauthorized: false // Required for Aiven/Cloud SQL
    }
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
