const db = require('../config/db');

const Menu = {
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM menu_items ORDER BY `order` ASC, id ASC');
        return rows;
    },

    create: async (data) => {
        const { label, url, order = 0, is_active = true } = data;
        const [result] = await db.query(
            'INSERT INTO menu_items (label, url, `order`, is_active) VALUES (?, ?, ?, ?)',
            [label, url, order, is_active]
        );
        return { id: result.insertId, ...data };
    },

    update: async (id, data) => {
        const keys = Object.keys(data);
        if (keys.length === 0) return 0;

        const setClause = keys.map(key => `\`${key}\` = ?`).join(', ');
        const values = [...Object.values(data), id];

        const [result] = await db.query(
            `UPDATE menu_items SET ${setClause} WHERE id = ?`,
            values
        );
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM menu_items WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Menu;
