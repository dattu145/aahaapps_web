const db = require('../config/db');

const User = {
    // Support login by email (preferred)
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    // Kept for compatibility, but queries name or email
    findByUsername: async (username) => {
        const [rows] = await db.query('SELECT * FROM users WHERE name = ? OR email = ?', [username, username]);
        return rows[0];
    },

    create: async ({ username, email, password, role }) => {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email || `${username}@example.com`, password, role || 'admin']
        );
        return { id: result.insertId, name: username, email, role };
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    update: async (id, { username, password, email }) => {
        const fields = [];
        const values = [];

        if (username) { fields.push('name = ?'); values.push(username); }
        if (password) { fields.push('password = ?'); values.push(password); }
        if (email) { fields.push('email = ?'); values.push(email); }

        if (fields.length === 0) return null;

        values.push(id);
        await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return true;
    }
};

module.exports = User;
