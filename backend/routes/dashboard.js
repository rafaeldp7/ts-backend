const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Dashboard routes
router.get('/overview', authenticateToken, dashboardController.getOverview);
router.get('/stats', authenticateToken, dashboardController.getStats);
router.get('/analytics', authenticateToken, dashboardController.getAnalytics);

module.exports = router;
