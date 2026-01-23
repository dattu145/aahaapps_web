const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const upload = require('../middleware/upload');

const uploadFields = upload.fields([
    { name: 'section1_images', maxCount: 10 },
    { name: 'section2_image', maxCount: 1 },
    { name: 'section2_video', maxCount: 1 }
]);

router.get('/', cardController.getCards);
router.get('/:id', cardController.getCardById);
router.post('/', uploadFields, cardController.createCard);
router.put('/:id', uploadFields, cardController.updateCard);
router.post('/reorder', cardController.reorderCards);
router.delete('/:id', cardController.deleteCard);

module.exports = router;
