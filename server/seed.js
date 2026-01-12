const db = require('./config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        // Create tables (simple migration simulation for development)
        // In production, use schema.sql directly or a migration tool
        // keeping this simple as per instructions "Refactor seed script"

        // Ideally we assume tables exist, but for "safe re-runs" we can check or just insert data.
        // The instructions said "Refactor the seed script...".
        // I will focus on seeding data. Schema creation is separate via schema.sql usually, 
        // but for a smooth dev experience I might want to ensure they exist? 
        // No, the plan says "Create MySQL database and tables (schema.sql)" as a separate step.
        // So seed.js is just for data.

        const hashedPassword = await bcrypt.hash('admin123', 10);

        // Check availability
        const [users] = await db.query('SELECT id FROM users WHERE name = ?', ['admin']);

        if (users.length === 0) {
            await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                ['admin', 'admin@example.com', hashedPassword, 'admin']
            );
            console.log('Admin user seeded: admin / admin123');
        } else {
            console.log('Admin user already exists.');
        }

    } catch (e) {
        console.error('Seeding failed:', e);
    } finally {
        // Close connection
        await db.end();
    }
};

// Handle independent execution
if (require.main === module) {
    seed();
}

module.exports = seed;
