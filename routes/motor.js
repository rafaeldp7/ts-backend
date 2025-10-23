const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');

// Motor analytics
router.post('/analytics-processing', motorController.processMotorAnalytics);
router.get('/analytics-aggregated', motorController.getMotorAnalyticsAggregated);

module.exports = router;