const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Authentication routes
router.post('/register', adminAuthController.register);
router.post('/login', adminAuthController.login);
router.post('/admin-login', adminAuthController.adminLogin);
router.post('/logout', adminAuthController.logout);

// Profile routes - Require authentication
router.get('/profile', authenticateToken, adminAuthController.getProfile);
router.put('/profile', authenticateToken, adminAuthController.updateProfile);
router.put('/change-password', authenticateToken, adminAuthController.changePassword);

// Token verification - Now with middleware to set req.user
router.get('/verify-token', authenticateToken, adminAuthController.verifyToken);

module.exports = router;