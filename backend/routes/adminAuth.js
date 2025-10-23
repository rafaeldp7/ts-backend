const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { authenticateAdmin } = require('../middleware/adminMiddleware');

// Admin authentication routes
router.post('/login', adminAuthController.login);
router.post('/logout', authenticateAdmin, adminAuthController.logout);
router.get('/profile', authenticateAdmin, adminAuthController.getProfile);
router.put('/profile', authenticateAdmin, adminAuthController.updateProfile);
router.put('/change-password', authenticateAdmin, adminAuthController.changePassword);
router.get('/verify-token', authenticateAdmin, adminAuthController.verifyToken);

module.exports = router;
