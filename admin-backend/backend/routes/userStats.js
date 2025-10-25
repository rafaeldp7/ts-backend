const express = require('express');
const router = express.Router();
const userStatsController = require('../controllers/userStatsController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// User statistics routes (all require admin authentication)
router.get('/total', authenticateAdmin, userStatsController.getTotalUsers);
router.get('/this-month', authenticateAdmin, userStatsController.getUsersThisMonth);
router.get('/statistics', authenticateAdmin, userStatsController.getUserStatistics);
router.get('/growth', authenticateAdmin, userStatsController.getUserGrowth);

module.exports = router;
