const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('Testing DB connection with config:');
    console.log({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            connectTimeout: 5000 // 5 seconds timeout
        });
        console.log('✅ Connection Sucessful!');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        if (error.code === 'ETIMEDOUT') {
            console.error('Possible causes: Firewall blocking IP, wrong Host, or Server is down.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('Possible causes: Wrong User or Password.');
        } else if (error.code === 'ENOTFOUND') {
            console.error('Possible causes: Wrong Hostname (DNS lookup failed).');
        }
    }
}

testConnection();
