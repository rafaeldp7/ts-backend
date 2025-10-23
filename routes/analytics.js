const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
// Analytics routes
router.get('/daily', analyticsController.generateDailyAnalytics);
router.get('/motor-efficiency', analyticsController.getMotorEfficiencyStats);
router.get('/user-timeline', analyticsController.getUserAnalyticsTimeline);
router.get('/fuel-trend', analyticsController.getUserFuelLogTrend);
router.get('/motor-ranking', analyticsController.getMotorEfficiencyRanking);

module.exports = router;
