const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const { body } = require('express-validator');

// Authentication routes (no auth required)
router.post('/register', authController.register); // Register and send OTP
router.post('/verify/:otp', authController.verifySignUpOTP); // Verify sign up OTP
router.post('/resend-verification', authController.resendVerification); // Resend sign up OTP
router.post('/login', authController.login);
router.post('/reset-password', authController.resetPassword); // Request password reset OTP
router.post('/verify-reset', authController.verifyReset); // Verify password reset OTP
router.post('/reset-password-with-otp', authController.resetPasswordWithOTP); // Reset password with OTP
router.post('/change-password',  authController.changePassword); // Requires auth
router.post('/logout',  authController.logout);
router.get('/verify-token',  authController.verifyToken);

// User profile routes
router.get('/profile',  authController.getProfile);

// User analytics routes
router.get('/user-growth',  authController.getUserGrowth);
router.get('/user-count',  authController.getUserCount);
router.get('/new-users-this-month',  authController.getNewUsersThisMonth);
router.get('/users',  authController.getUsers);
router.get('/first-user-name',  authController.getFirstUserName);
router.get('/check-user',  authController.checkUserExists);

module.exports = router;
