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

        // Parse JSON fields (multipart sends them as strings)
        const buttons = req.body.buttons ? JSON.parse(req.body.buttons) : [];

        // Existing URLs passed as text (if any - optional based on frontend implementation, usually create is just raw files)
        // If user sends URLs as strings in 'section1_images_urls' or similar, handle here. 
        // For now assuming creation is mostly new files, but we can merge if needed.

        const cardData = {
            ...req.body,
            section1_images, // Overwriting string/array from body with file paths
            section2_image,
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

        let { section1_images, section2_image, buttons, ...otherFields } = req.body;

        // 1. Handle Section 2 Main Image
        if (req.files['section2_image'] && req.files['section2_image'][0]) {
            // New file uploaded, delete old one
            deleteFile(card.section2_image);
            section2_image = `uploads/${req.files['section2_image'][0].filename}`;
        } else {
            // No new file, keep existing or use what was sent in body (if string URL)
            // If client sends 'null' string or empty for deletion, handle that logic if needed.
            // Assuming if not in files, we look at body.
        }

        // 2. Handle Section 1 Images (Gallery)
        // This is tricky. We need to merge existing URLs with new file uploads.
        // Client should send `section1_images` as an array of strings (existing URLs).
        // New files are in `req.files['section1_images']`.

        let updatedSection1Images = [];

        // Parse existing images sent as string/JSON from body
        if (typeof section1_images === 'string') {
            try {
                updatedSection1Images = JSON.parse(section1_images);
            } catch (e) {
                // It might be a single URL string or invalid JSON
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

        // Clean up erased images? 
        // If the client sends the *complete* list of images they want to keep (excluding ones they deleted),
        // then we should identify which old images are MISSING from `updatedSection1Images` and delete them from disk.
        const oldImages = card.section1_images || [];
        const imagesToDelete = oldImages.filter(img => !updatedSection1Images.includes(img));
        imagesToDelete.forEach(img => deleteFile(img));


        // 3. Handle Buttons
        if (typeof buttons === 'string') {
            buttons = JSON.parse(buttons);
        }

        // Update
        const updateData = {
            ...otherFields,
            section1_images: updatedSection1Images,
            section2_image: section2_image || card.section2_image, // Keep old if not provided in body/files
            buttons: buttons || card.buttons
        };

        await Card.update(req.params.id, updateData);

        const updatedCard = await Card.findById(req.params.id);
        res.json(updatedCard);

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
        if (card.section1_images && Array.isArray(card.section1_images)) {
            card.section1_images.forEach(img => deleteFile(img));
        }

        await Card.delete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
