const pool = require('../config/db');
const fs = require('fs/promises');
const path = require('path');

exports.getConfig = async (req, res) => {
    try {
        res.json({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            // Never return the password
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadSql = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No SQL file uploaded' });
    }

    try {
        const sqlContent = await fs.readFile(req.file.path, 'utf8');

        // Execute the SQL content
        // multipleStatements: true must be enabled in db config
        await pool.query(sqlContent);

        // Cleanup: Delete the uploaded file after execution
        await fs.unlink(req.file.path);

        res.json({ message: 'Database updated successfully from SQL dump.' });
    } catch (error) {
        console.error('SQL Execution Error:', error);
        // Attempt cleanup even on error
        try { await fs.unlink(req.file.path); } catch (e) { }
        res.status(500).json({ error: 'Failed to execute SQL: ' + error.message });
    }
};
