const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Trip processing
router.post('/calculate-statistics', tripController.calculateTripStatistics);
router.post('/summary-analysis', tripController.generateTripSummary);
router.post('/cache-management', tripController.manageTripCache);

module.exports = router;