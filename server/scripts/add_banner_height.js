const db = require('../config/db');

async function addHeightColumn() {
    try {
        console.log('Adding height column to banners table...');

        // Check if column exists, if not add it.
        // Simple way: Try to add it, if error 1060 (Duplicate column name), ignore.
        try {
            await db.query(`ALTER TABLE banners ADD COLUMN height INT DEFAULT 400`);
            console.log('Successfully added height column.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column height already exists.');
            } else {
                throw err;
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

addHeightColumn();
