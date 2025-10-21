const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// Analytics routes
router.get('/dashboard', authenticateToken, analyticsController.getDashboard);
router.get('/trips', authenticateToken, analyticsController.getTripAnalytics);
router.get('/fuel', authenticateToken, analyticsController.getFuelAnalytics);
router.get('/maintenance', authenticateToken, analyticsController.getMaintenanceAnalytics);
router.get('/performance', authenticateToken, analyticsController.getPerformanceAnalytics);
router.get('/reports', authenticateToken, analyticsController.getReportAnalytics);
router.get('/export', authenticateToken, analyticsController.exportAnalytics);

module.exports = router;
