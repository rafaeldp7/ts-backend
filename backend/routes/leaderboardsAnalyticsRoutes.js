const express = require('express');
const router = express.Router();
const controller = require('../controllers/leaderboardsAnalyticsController');

// GET /api/leaderboard-analytics/monthly
router.get('/monthly', controller.getMonthlyLeaderboard);

module.exports = router;
