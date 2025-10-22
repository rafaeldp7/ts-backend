const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset', authController.verifyReset);
router.post('/change-password', authenticateToken, authController.changePassword);
router.post('/logout', authenticateToken, authController.logout);
router.get('/verify-token', authenticateToken, authController.verifyToken);

// User analytics routes
router.get('/user-growth', authenticateToken, authController.getUserGrowth);
router.get('/user-count', authenticateToken, authController.getUserCount);
router.get('/users', authenticateToken, authController.getUsers);
router.get('/first-user-name', authenticateToken, authController.getFirstUserName);

module.exports = router;
