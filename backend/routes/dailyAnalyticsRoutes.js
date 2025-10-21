const express = require('express');
const router = express.Router();
const controller = require('../controllers/dailyAnalyticsController');

// GET /api/daily-analytics/:motorId
router.get('/:motorId', controller.getMotorDailyAnalyticsHistory);

module.exports = router;
