const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const init = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const statements = schema.split(';').filter(stmt => stmt.trim());

        for (const statement of statements) {
            if (statement.trim()) {
                await db.query(statement);
            }
        }
        console.log('Database initialized with schema.sql');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
    process.exit();
};

init();
