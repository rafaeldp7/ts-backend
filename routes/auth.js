const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { body } = require('express-validator');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-reset', authController.verifyReset);
router.post('/change-password',  authController.changePassword);
router.post('/logout',  authController.logout);
router.get('/verify-token',  authController.verifyToken);

// User profile routes
router.get('/profile',  authController.getProfile);

// User analytics routes
router.get('/user-growth',  authController.getUserGrowth);
router.get('/user-count',  authController.getUserCount);
router.get('/users',  authController.getUsers);
router.get('/first-user-name',  authController.getFirstUserName);

module.exports = router;
