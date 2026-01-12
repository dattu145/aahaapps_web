const express = require('express');
const router = express.Router();
const multer = require('multer');
const databaseController = require('../controllers/databaseController');
const path = require('path');

// Configure multer for temporary storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'temp-import-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.sql') {
            cb(null, true);
        } else {
            cb(new Error('Only .sql files are allowed'));
        }
    }
});

router.get('/config', databaseController.getConfig);
router.post('/upload', upload.single('sqlFile'), databaseController.uploadSql);

module.exports = router;
