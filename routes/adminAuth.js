const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// Authentication routes (no authentication for testing)
router.post('/login', adminAuthController.login);
router.post('/logout', adminAuthController.logout);
router.get('/profile', adminAuthController.getProfile);
router.put('/profile', adminAuthController.updateProfile);
router.put('/change-password', adminAuthController.changePassword);
router.get('/verify-token', adminAuthController.verifyToken);

module.exports = router;
