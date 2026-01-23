const Card = require('../models/Card');
const fs = require('fs');
const path = require('path');

// Helper to delete file
const deleteFile = (filePath) => {
    if (filePath) {
        const fullPath = path.join(__dirname, '..', filePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
};

// Get all cards
exports.getCards = async (req, res) => {
    try {
        const cards = await Card.findAll();
        res.json(cards);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single card by ID
exports.getCardById = async (req, res) => {
    console.log(`[getCardById] Request for ID: ${req.params.id}`);
    try {
        const card = await Card.findById(req.params.id);
        console.log(`[getCardById] Found card:`, card ? 'Yes' : 'No');

        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        console.error(`[getCardById] Error:`, error);
        res.status(500).json({ message: error.message, stack: error.stack });
    }
};

// Create a new card
exports.createCard = async (req, res) => {
    try {
        // Handle file uploads
        const section1_images = req.files['section1_images']
            ? req.files['section1_images'].map(file => `uploads/${file.filename}`)
            : [];
        const section2_image = req.files['section2_image'] && req.files['section2_image'][0]
            ? `uploads/${req.files['section2_image'][0].filename}`
            : null;
        const section2_video = req.files['section2_video'] && req.files['section2_video'][0]
            ? `uploads/${req.files['section2_video'][0].filename}`
            : null;

        // Parse JSON fields (multipart sends them as strings)
        const buttons = req.body.buttons ? JSON.parse(req.body.buttons) : [];
        const video_options = req.body.video_options ? JSON.parse(req.body.video_options) : {};

        const cardData = {
            ...req.body,
            section1_images, // Overwriting string/array from body with file paths
            section2_image,
            section2_video,
            video_options,
            buttons
        };

        const card = await Card.create(cardData);
        res.status(201).json(card);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a card
exports.updateCard = async (req, res) => {
    try {

        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        let { section1_images, section2_image, section2_video, buttons, video_options, ...otherFields } = req.body;

        // 1. Handle Section 2 Main Image
        if (req.files['section2_image'] && req.files['section2_image'][0]) {
            // New file uploaded, delete old one
            deleteFile(card.section2_image);
            section2_image = `uploads/${req.files['section2_image'][0].filename}`;
        } else {
            // Keep existing (handled by default pass-through of undefined or explicitly handled below)
        }

        // 1b. Handle Section 2 Video
        if (req.files['section2_video'] && req.files['section2_video'][0]) {
            deleteFile(card.section2_video);
            section2_video = `uploads/${req.files['section2_video'][0].filename}`;
        } else if (section2_video === 'DELETE') {
            deleteFile(card.section2_video);
            section2_video = null;
        } else {
            section2_video = card.section2_video; // Default keep existing
        }

        // 2. Handle Section 1 Images (Gallery)
        let updatedSection1Images = [];

        // Parse existing images sent as string/JSON from body
        if (typeof section1_images === 'string') {
            try {
                updatedSection1Images = JSON.parse(section1_images);
            } catch (e) {
                updatedSection1Images = [section1_images];
            }
        } else if (Array.isArray(section1_images)) {
            updatedSection1Images = section1_images;
        }

        // Add new uploaded files
        if (req.files['section1_images']) {
            const newFilePaths = req.files['section1_images'].map(file => `uploads/${file.filename}`);
            updatedSection1Images = [...updatedSection1Images, ...newFilePaths];
        }

        const oldImages = card.section1_images || [];
        const imagesToDelete = oldImages.filter(img => !updatedSection1Images.includes(img));
        imagesToDelete.forEach(img => deleteFile(img));


        // 3. Handle Buttons & Video Options
        if (typeof buttons === 'string') {
            buttons = JSON.parse(buttons);
        }
        if (typeof video_options === 'string') {
            video_options = JSON.parse(video_options);
        }

        // Update
        const updateData = {
            ...otherFields,
            section1_images: updatedSection1Images,
            section2_image: section2_image || card.section2_image,
            section2_video: section2_video, // Now correctly handles null
            video_options: video_options || card.video_options,
            buttons: buttons || card.buttons
        };

        await Card.update(req.params.id, updateData);

        const updatedCard = await Card.findById(req.params.id);
        res.json(updatedCard);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Reorder cards
exports.reorderCards = async (req, res) => {
    try {
        const { order } = req.body; // Array of { id, sort_order }
        const updatePromises = order.map(({ id, sort_order }) => {
            return Card.update(id, { sort_order });
        });

        await Promise.all(updatePromises);
        res.status(200).json({ message: 'Reorder successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a card
exports.deleteCard = async (req, res) => {
    try {

        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }

        // Delete associated files
        if (card.section2_image) {
            deleteFile(card.section2_image);
        }
        if (card.section2_video) {
            deleteFile(card.section2_video);
        }
        if (card.section1_images && Array.isArray(card.section1_images)) {
            card.section1_images.forEach(img => deleteFile(img));
        }

        await Card.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
