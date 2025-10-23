const express = require('express');
const router = express.Router();
const calculationController = require('../controllers/calculationController');

// Distance calculations
router.post('/distance', calculationController.calculateDistance);
router.post('/fuel-consumption', calculationController.calculateFuelConsumption);
router.post('/trip-statistics', calculationController.calculateTripStatistics);

module.exports = router;
