const db = require('../config/db');

const Card = {
    // Helper to map DB row to frontend model object
    toModel: (row) => {
        if (!row) return null;
        let sec1Images = [];
        try {
            sec1Images = typeof row.section1_images === 'string' ? JSON.parse(row.section1_images || '[]') : (row.section1_images || []);
        } catch (e) {
            sec1Images = [];
        }

        let buttons = [];
        try {
            buttons = typeof row.buttons === 'string' ? JSON.parse(row.buttons || '[]') : (row.buttons || []);
        } catch (e) {
            buttons = [];
        }

        let videoOptions = {};
        try {
            videoOptions = typeof row.video_options === 'string' ? JSON.parse(row.video_options || '{}') : (row.video_options || {});
        } catch (e) {
            videoOptions = {};
        }

        return {
            id: row.id,
            title: row.title,
            description: row.description,
            section1_images: sec1Images,
            section2_image: row.section2_image,
            section2_video: row.section2_video,
            video_options: videoOptions,
            buttons: buttons,
            enquiry_link: row.enquiry_link || row.link, // Fallback to link if enquiry_link is empty
            card_bg_color: row.card_bg_color || row.color, // Fallback to color
            title_color: row.title_color || row.text_color, // Fallback to text_color
            desc_color: row.desc_color,
            thumbnail_width: row.section1_image_width,
            thumbnail_height: row.section1_image_height,
            is_active: row.is_active,
            sort_order: row.sort_order,
            created_at: row.created_at,
            updated_at: row.updated_at
        };
    },

    findAll: async () => {
        const [rows] = await db.query('SELECT * FROM circular_items ORDER BY sort_order ASC');
        return rows.map(Card.toModel);
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT * FROM circular_items WHERE id = ?', [id]);
        return Card.toModel(rows[0]);
    },

    create: async (data) => {
        const {
            title, description, section1_images, section2_image, section2_video, video_options, buttons, enquiry_link,
            card_bg_color, title_color, desc_color, thumbnail_width, thumbnail_height,
            is_active, sort_order
        } = data;

        const [result] = await db.query(
            `INSERT INTO circular_items (
                title, description, section1_images, section2_image, section2_video, video_options, buttons, enquiry_link, link,
                card_bg_color, title_color, desc_color, section1_image_width, section1_image_height,
                is_active, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, description, JSON.stringify(section1_images || []), section2_image, section2_video, JSON.stringify(video_options || {}), JSON.stringify(buttons || []), enquiry_link, enquiry_link || '',
                card_bg_color, title_color, desc_color, thumbnail_width, thumbnail_height,
                is_active !== undefined ? is_active : 1, sort_order || 0
            ]
        );

        return Card.findById(result.insertId);
    },

    update: async (id, data) => {
        const updates = [];
        const values = [];

        if (data.title !== undefined) { updates.push('title = ?'); values.push(data.title); }
        if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description); }
        if (data.section1_images !== undefined) { updates.push('section1_images = ?'); values.push(JSON.stringify(data.section1_images)); }
        if (data.section2_image !== undefined) { updates.push('section2_image = ?'); values.push(data.section2_image); }
        if (data.section2_video !== undefined) { updates.push('section2_video = ?'); values.push(data.section2_video); }
        if (data.video_options !== undefined) { updates.push('video_options = ?'); values.push(JSON.stringify(data.video_options)); }
        if (data.buttons !== undefined) { updates.push('buttons = ?'); values.push(JSON.stringify(data.buttons)); }
        if (data.enquiry_link !== undefined) { updates.push('enquiry_link = ?'); values.push(data.enquiry_link); }
        if (data.card_bg_color !== undefined) { updates.push('card_bg_color = ?'); values.push(data.card_bg_color); }
        if (data.title_color !== undefined) { updates.push('title_color = ?'); values.push(data.title_color); }
        if (data.desc_color !== undefined) { updates.push('desc_color = ?'); values.push(data.desc_color); }
        if (data.thumbnail_width !== undefined) { updates.push('section1_image_width = ?'); values.push(data.thumbnail_width); }
        if (data.thumbnail_height !== undefined) { updates.push('section1_image_height = ?'); values.push(data.thumbnail_height); }
        if (data.is_active !== undefined) { updates.push('is_active = ?'); values.push(data.is_active); }
        if (data.sort_order !== undefined) { updates.push('sort_order = ?'); values.push(data.sort_order); }

        if (updates.length === 0) return 0;

        values.push(id);
        const [result] = await db.query(`UPDATE circular_items SET ${updates.join(', ')} WHERE id = ?`, values);
        return result.affectedRows;
    },

    delete: async (id) => {
        const [result] = await db.query('DELETE FROM circular_items WHERE id = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Card;
