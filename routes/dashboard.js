const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Dashboard routes
router.get('/overview', dashboardController.getOverview);
router.get('/stats', dashboardController.getStats);
router.get('/analytics', dashboardController.getAnalytics);

module.exports = router;
