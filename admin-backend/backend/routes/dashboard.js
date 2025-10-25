const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getDashboardStats,
  getUserDashboard,
  getAdminDashboard,
  getAnalytics
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// User dashboard routes
router.get('/overview', authenticateToken, getDashboardOverview);
router.get('/stats', authenticateToken, getDashboardStats);
router.get('/user', authenticateToken, getUserDashboard);
router.get('/analytics', authenticateToken, getAnalytics);

// Admin dashboard routes
router.get('/admin', authenticateAdmin, getAdminDashboard);

module.exports = router;
