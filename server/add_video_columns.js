const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    multipleStatements: true,
    ssl: { rejectUnauthorized: false }
};

async function addColumns() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connected to database.');

        const sql = `
            ALTER TABLE circular_items
            ADD COLUMN section2_video VARCHAR(255) DEFAULT NULL,
            ADD COLUMN video_options JSON DEFAULT NULL;
        `;

        await connection.query(sql);
        console.log('Columns added successfully.');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist.');
        } else {
            console.error('Error adding columns:', error);
        }
    } finally {
        if (connection) await connection.end();
    }
}

addColumns();
