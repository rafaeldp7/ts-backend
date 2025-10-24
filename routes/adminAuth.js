const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

// Authentication routes
router.post('/register', adminAuthController.register);
router.post('/login', adminAuthController.login);
router.post('/admin-login', adminAuthController.adminLogin);
router.post('/logout', adminAuthController.logout);

// Profile routes
router.get('/profile', adminAuthController.getProfile);
router.put('/profile', adminAuthController.updateProfile);
router.put('/change-password', adminAuthController.changePassword);

// Token verification
router.get('/verify-token', adminAuthController.verifyToken);

module.exports = router;