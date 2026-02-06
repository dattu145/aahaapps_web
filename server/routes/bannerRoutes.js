const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const upload = require('../middleware/upload');

// Allow uploading multiple files. 'media_files' is the field name.
const uploadFiles = upload.array('media_files', 20); // Max 20 files at a time

router.get('/', bannerController.getBanners);
router.get('/:id', bannerController.getBannerById);
router.post('/', uploadFiles, bannerController.createBanner);
router.put('/:id', uploadFiles, bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
