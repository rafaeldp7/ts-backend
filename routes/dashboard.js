const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// Dashboard routes
router.get('/overview', protect, dashboardController.getOverview);
router.get('/stats', protect, dashboardController.getStats);
router.get('/analytics', protect, dashboardController.getAnalytics);

module.exports = router;
