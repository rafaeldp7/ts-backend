const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');

// GET /api/fuel/combined - Combined fuel data (fuel logs + maintenance refuels)
router.get('/combined', fuelController.getCombinedFuelData);

// GET /api/fuel/efficiency - Fuel efficiency analytics
router.get('/efficiency', fuelController.getFuelEfficiencyAnalytics);

// GET /api/fuel/cost-analysis - Fuel cost analysis
router.get('/cost-analysis', fuelController.getFuelCostAnalysis);

module.exports = router;
