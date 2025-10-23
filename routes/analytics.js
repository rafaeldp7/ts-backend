const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Analytics routes
router.get('/daily', authenticateToken, analyticsController.generateDailyAnalytics);
router.get('/motor-efficiency', authenticateToken, analyticsController.getMotorEfficiencyStats);
router.get('/user-timeline', authenticateToken, analyticsController.getUserAnalyticsTimeline);
router.get('/fuel-trend', authenticateToken, analyticsController.getUserFuelLogTrend);
router.get('/motor-ranking', authenticateToken, analyticsController.getMotorEfficiencyRanking);

module.exports = router;
