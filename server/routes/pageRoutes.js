const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const upload = require('../middleware/upload'); // Needed if we add image upload endpoint specifically for pages later, but for now images are handled generally

// Public getter for dynamic routing
router.get('/slug/:slug', pageController.getPageBySlug);

// Admin CRUD
router.get('/', pageController.getAllPages);
router.get('/:id', pageController.getPageById);
router.post('/', pageController.createPage);
router.put('/:id', pageController.updatePage);
router.delete('/:id', pageController.deletePage);

// Editor Image Upload Endpoint (Returns URL for Quill)
router.post('/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

module.exports = router;
