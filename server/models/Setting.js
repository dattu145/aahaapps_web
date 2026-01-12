const db = require('../config/db');

const Setting = {
    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM settings');
        return rows;
    },

    findByKey: async (key) => {
        const [rows] = await db.query('SELECT * FROM settings WHERE `key` = ?', [key]);
        return rows[0];
    },

    create: async ({ key, value }) => {
        const [result] = await db.query(
            'INSERT INTO settings (`key`, value) VALUES (?, ?)',
            [key, value]
        );
        return { id: result.insertId, key, value };
    },

    update: async (key, value) => {
        const [result] = await db.query(
            'UPDATE settings SET value = ? WHERE `key` = ?',
            [value, key]
        );
        return result.affectedRows;
    },

    // Helper for findOrCreate logic
    findOrCreate: async ({ key, value }) => {
        let setting = await Setting.findByKey(key);
        if (setting) {
            return { setting, created: false };
        }
        const newSetting = await Setting.create({ key, value });
        return { setting: newSetting, created: true };
    }
};

module.exports = Setting;
