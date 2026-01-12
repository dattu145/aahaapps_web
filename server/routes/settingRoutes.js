const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const settingController = require('../controllers/settingController');

router.get('/', settingController.getSettings);
router.post('/', upload.single('file'), settingController.updateSetting); // Single update with optional file
router.put('/', settingController.updateSettings); // Bulk update

module.exports = router;
