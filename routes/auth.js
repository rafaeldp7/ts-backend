const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset', authController.verifyReset);
router.post('/change-password', protect, authController.changePassword);
router.post('/logout', protect, authController.logout);
router.get('/verify-token', protect, authController.verifyToken);

// User profile routes
router.get('/profile', protect, authController.getProfile);

// User analytics routes
router.get('/user-growth', protect, authController.getUserGrowth);
router.get('/user-count', protect, authController.getUserCount);
router.get('/users', protect, authController.getUsers);
router.get('/first-user-name', protect, authController.getFirstUserName);

module.exports = router;
