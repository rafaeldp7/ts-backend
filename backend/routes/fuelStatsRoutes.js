const express = require('express');
const router = express.Router();
const controller = require('../controllers/fuelStatsController');

// GET /api/fuel-stats/:motorId
router.get('/:motorId', controller.getFuelStatsByMotor);

module.exports = router;
