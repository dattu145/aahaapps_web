const db = require('../config/db');

const Page = {
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM pages');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM pages WHERE id = ?', [id]);
        return rows[0];
    },

    findBySlug: async (slug) => {
        const [rows] = await db.query('SELECT * FROM pages WHERE slug = ? AND is_active = 1', [slug]);
        return rows[0];
    },

    create: async (data) => {
        const { title, slug, content, is_active } = data;
        // Default is_active to true if not provided
        const activeVal = is_active === undefined ? true : is_active;

        const [result] = await db.query(
            'INSERT INTO pages (title, slug, content, is_active) VALUES (?, ?, ?, ?)',
            [title, slug, content, activeVal]
        );
        return { id: result.insertId, ...data, is_active: activeVal };
    },

    update: async (id, data) => {
        const keys = Object.keys(data);
        if (keys.length === 0) return 0;

        const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');
        const values = [...Object.values(data), id];

        const [result] = await db.query(
            `UPDATE pages SET ${setClause} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM pages WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Page;
