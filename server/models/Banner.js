const db = require('../config/db');

const Banner = {
    // Helper to map DB row to frontend model object
    toModel: (row) => {
        if (!row) return null;
        let mediaItems = [];
        try {
            mediaItems = typeof row.media_items === 'string' ? JSON.parse(row.media_items || '[]') : (row.media_items || []);
        } catch (e) {
            mediaItems = [];
        }

        return {
            id: row.id,
            name: row.name,
            media_items: mediaItems,
            speed: row.speed,
            placement: row.placement, // 'top', 'bottom', 'relative'
            target_card_id: row.target_card_id,
            relative_position: row.relative_position, // 'before', 'after'
            is_active: row.is_active,
            height: row.height || 400, // Default to 400 if null
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    },

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM banners ORDER BY created_at DESC');
        return rows.map(Banner.toModel);
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM banners WHERE id = ?', [id]);
        return Banner.toModel(rows[0]);
    },

    create: async (data) => {
        const {
            name, media_items, speed, placement, target_card_id, relative_position, is_active
        } = data;

        const [result] = await db.query(
            `INSERT INTO banners (
                name, media_items, speed, placement, target_card_id, relative_position, is_active, height
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                JSON.stringify(media_items || []),
                speed || 10,
                placement || 'top',
                target_card_id || null,
                relative_position || null,
                is_active !== undefined ? is_active : 1,
                data.height || 400
            ]
        );

        return Banner.findById(result.insertId);
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];

        if (data.name !== undefined) { updates.push('name = ?'); values.push(data.name); }
        if (data.media_items !== undefined) { updates.push('media_items = ?'); values.push(JSON.stringify(data.media_items)); }
        if (data.speed !== undefined) { updates.push('speed = ?'); values.push(data.speed); }
        if (data.placement !== undefined) { updates.push('placement = ?'); values.push(data.placement); }
        if (data.target_card_id !== undefined) { updates.push('target_card_id = ?'); values.push(data.target_card_id); }
        if (data.relative_position !== undefined) { updates.push('relative_position = ?'); values.push(data.relative_position); }
        if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active); }
        if (data.height !== undefined) { updates.push('height = ?'); values.push(data.height); }

        if (updates.length === 0) return 0;

        values.push(id);
        const [result] = await db.query(`UPDATE banners SET ${updates.join(', ')} WHERE id = ?`, values);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM banners WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Banner;
