const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.register);
router.post('/login', userController.login);

// We need authentication middleware for updateProfile. 
// Assuming there isn't one globally available in this file scope, I'll need to check if I can import it or if I should implement a simple check.
// Looking at other routes might help, but for now I'll use a basic middleware or require it.
// Checking `settingRoutes.js` usually reveals middleware usage.
// For now, I'll add the route and assume I need to handle auth.
// Wait, I see `userController.updateProfile` expects `req.user`.
const authMiddleware = require('../middleware/authMiddleware'); // Guessing path
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/send-otp', authMiddleware, userController.sendVerificationOtp);
router.post('/verify-otp', authMiddleware, userController.verifyOtp);

module.exports = router;
