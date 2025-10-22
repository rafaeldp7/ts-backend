const express = require('express');
const router = express.Router();
const geographyController = require('../controllers/geographyController');
const { authenticateToken } = require('../middleware/auth');

// Geography routes
router.get('/', authenticateToken, geographyController.getGeographyData);
router.get('/barangay/:barangay', authenticateToken, geographyController.getBarangayData);
router.get('/statistics', authenticateToken, geographyController.getGeographyStatistics);

module.exports = router;
