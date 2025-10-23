const express = require('express');
const router = express.Router();
const fuelController = require('../controllers/fuelController');

// Fuel calculations
router.post('/calculate', fuelController.calculateFuelConsumption);
router.post('/combine-data', fuelController.combineFuelData);
router.post('/calculate-after-refuel', fuelController.calculateFuelLevelAfterRefuel);
router.post('/calculate-drivable-distance', fuelController.calculateDrivableDistance);

module.exports = router;
