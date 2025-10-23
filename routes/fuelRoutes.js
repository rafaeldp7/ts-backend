const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');
const { protect } = require('../middlewares/authMiddleware');

// GET /api/fuel/combined - Combined fuel data (fuel logs + maintenance refuels)
router.get('/combined', protect, fuelController.getCombinedFuelData);

// GET /api/fuel/efficiency - Fuel efficiency analytics
router.get('/efficiency', protect, fuelController.getFuelEfficiencyAnalytics);

// GET /api/fuel/cost-analysis - Fuel cost analysis
router.get('/cost-analysis', protect, fuelController.getFuelCostAnalysis);

module.exports = router;
