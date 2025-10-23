const express = require('express');
const router = express.Router();
const geographyController = require('../controllers/geographyController');
const { protect } = require('../middleware/authMiddleware');

// Geography routes
router.get('/', protect, geographyController.getGeographyData);
router.get('/barangay/:barangay', protect, geographyController.getBarangayData);
router.get('/statistics', protect, geographyController.getGeographyStatistics);

module.exports = router;
