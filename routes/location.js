const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// Location processing
router.post('/process-background', locationController.processBackgroundLocation);
router.post('/snap-roads', locationController.snapToRoads);

module.exports = router;
