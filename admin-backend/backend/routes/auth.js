const express = require('express');
const router = express.Router();
const {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
  getUserStats
} = require('../controllers/authController');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);
router.post('/logout', authenticateToken, logout);
router.get('/verify', authenticateToken, verifyToken);

// Admin routes
router.get('/stats', authenticateAdmin, getUserStats);

module.exports = router;
