const Menu = require('../models/Menu');

// Get all menu items
exports.getMenus = async (req, res) => {
    try {
        const menus = await Menu.findAll();
        res.json(menus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create menu item
exports.createMenu = async (req, res) => {
    try {
        const menu = await Menu.create(req.body);
        res.status(201).json(menu);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update menu item
exports.updateMenu = async (req, res) => {
    try {
        const updated = await Menu.update(req.params.id, req.body);
        if (updated) {
            // Fetch updated item to return
            const [rows] = await require('../config/db').query('SELECT * FROM menu_items WHERE id = ?', [req.params.id]);
            res.json(rows[0]);
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Reorder menu items
exports.reorderMenus = async (req, res) => {
    try {
        const { order } = req.body;
        const updatePromises = order.map(({ id, sort_order }) => {
            // Map frontend 'sort_order' to database column 'order'
            return Menu.update(id, { order: sort_order });
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: 'Menu reorder successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete menu item
exports.deleteMenu = async (req, res) => {
    try {
        const deleted = await Menu.delete(req.params.id);
        if (deleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
