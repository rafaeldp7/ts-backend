const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');

// Location tracking
router.post('/process-location', trackingController.processLocationUpdate);

module.exports = router;
