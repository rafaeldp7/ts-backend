const express = require('express');
const router = express.Router();
const geographyController = require('../controllers/geographyController');


// Geography routes
router.get('/',  geographyController.getGeographyData);
router.get('/barangay/:barangay',  geographyController.getBarangayData);
router.get('/statistics',  geographyController.getGeographyStatistics);

module.exports = router;
