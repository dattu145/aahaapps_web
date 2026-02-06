const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');

// Helper to delete a file
const deleteFile = (filePath) => {
    if (filePath && !filePath.startsWith('http')) {
        const fullPath = path.join(__dirname, '../../', filePath);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            } catch (e) {
                console.error(`Failed to delete file ${fullPath}:`, e);
            }
        }
    }
};

// Helper: Normalize value (handle array or single value)
const normalizeValue = (val) => {
    if (Array.isArray(val) && val.length > 0) return val[0];
    return val;
};

// Helper: robust boolean conversion
const toBoolean = (val) => {
    if (val === undefined || val === null) return undefined;
    const s = String(val).toLowerCase();
    return s === 'true' || s === '1' || s === 'on';
};


// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.findAll();
        res.json(banners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single banner by ID
exports.getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }
        res.json(banner);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new banner
exports.createBanner = async (req, res) => {
    try {
        const { name, speed, placement, target_card_id, relative_position, is_active } = req.body;

        let mediaItems = [];
        // Parse manual entries (YouTube links or existing structure if passed manually)
        if (req.body.media_items) {
            try {
                mediaItems = JSON.parse(req.body.media_items);
            } catch (e) {
                mediaItems = [];
            }
        }

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            const uploadedItems = req.files.map(file => {
                const isVideo = file.mimetype.startsWith('video/');
                return {
                    type: isVideo ? 'video' : 'image',
                    url: `uploads/${file.filename}`
                };
            });
            mediaItems = [...mediaItems, ...uploadedItems];
        }

        const rawActive = normalizeValue(is_active);

        const bannerData = {
            name,
            speed: parseInt(speed) || 10,
            placement,
            target_card_id: target_card_id ? parseInt(target_card_id) : null,
            relative_position: normalizeValue(relative_position),
            is_active: rawActive !== undefined ? toBoolean(rawActive) : true,
            height: req.body.height ? parseInt(req.body.height) : 400,
            media_items: mediaItems
        };

        const banner = await Banner.create(bannerData);
        res.status(201).json(banner);
    } catch (error) {
        console.error('Create Banner Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Update a banner
exports.updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        const { name, speed, placement, target_card_id, relative_position, is_active } = req.body;

        // Process media items
        let newMediaItemsList = [];

        // 1. Existing items (retained)
        if (req.body.media_items) {
            try {
                newMediaItemsList = JSON.parse(req.body.media_items);
            } catch (e) {
                newMediaItemsList = [];
            }
        }

        // 2. New Uploads
        if (req.files && req.files.length > 0) {
            const uploadedItems = req.files.map(file => {
                const isVideo = file.mimetype.startsWith('video/');
                return {
                    type: isVideo ? 'video' : 'image',
                    url: `uploads/${file.filename}`
                };
            });
            newMediaItemsList = [...newMediaItemsList, ...uploadedItems];
        }

        // 3. Cleanup deleted files
        // Identify files that were in `banner.media_items` but are NOT in `newMediaItemsList`
        const oldFiles = banner.media_items.filter(item => item.type !== 'youtube').map(item => item.url);
        const newFiles = newMediaItemsList.filter(item => item.type !== 'youtube').map(item => item.url);

        const filesToDelete = oldFiles.filter(url => !newFiles.includes(url));
        filesToDelete.forEach(url => deleteFile(url));

        const rawActive = normalizeValue(is_active);

        const updateData = {
            name,
            speed: speed !== undefined ? parseInt(speed) : undefined,
            placement,
            target_card_id: target_card_id ? parseInt(target_card_id) : null,
            relative_position: normalizeValue(relative_position),
            is_active: rawActive !== undefined ? toBoolean(rawActive) : undefined,
            height: req.body.height ? parseInt(req.body.height) : undefined,
            media_items: newMediaItemsList
        };

        await Banner.update(req.params.id, updateData);

        const updatedBanner = await Banner.findById(req.params.id);
        res.json(updatedBanner);

    } catch (error) {
        console.error('Update Banner Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ message: 'Banner not found' });
        }

        // Delete all files associated with this banner
        if (banner.media_items && Array.isArray(banner.media_items)) {
            banner.media_items.forEach(item => {
                if (item.type !== 'youtube') {
                    deleteFile(item.url);
                }
            });
        }

        await Banner.delete(req.params.id);
        res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
