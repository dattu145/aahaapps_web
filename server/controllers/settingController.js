const Setting = require('../models/Setting');

// Get all settings
exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        // Convert to object { key: value }
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update or Create a setting
exports.updateSetting = async (req, res) => {
    let { key, value } = req.body;

    // If a file was uploaded, use the filename as the value
    if (req.file) {
        value = `uploads/${req.file.filename}`;
    }

    try {
        const { setting, created } = await Setting.findOrCreate({ key, value });

        if (!created) {
            await Setting.update(key, value);
            setting.value = value;
        }

        res.json(setting);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Bulk update settings
exports.updateSettings = async (req, res) => {
    const settings = req.body; // Expecting { key: value, key2: value2 }
    try {
        const promises = Object.keys(settings).map(async (key) => {
            const { setting, created } = await Setting.findOrCreate({ key, value: settings[key] });
            if (!created) {
                await Setting.update(key, settings[key]);
                setting.value = settings[key];
            }
            return setting;
        });
        await Promise.all(promises);
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
