const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
    { name: 'section1_images', maxCount: 10 },
    { name: 'section2_image', maxCount: 1 }
]);

router.get('/', cardController.getCards);
router.post('/', uploadFields, cardController.createCard);
router.put('/:id', uploadFields, cardController.updateCard);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
