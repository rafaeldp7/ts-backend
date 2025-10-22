const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticateToken } = require('../middleware/auth');

// Export routes
router.get('/users', authenticateToken, exportController.exportUsers);
router.get('/reports', authenticateToken, exportController.exportReports);
router.get('/gas-stations', authenticateToken, exportController.exportGasStations);
router.get('/trips', authenticateToken, exportController.exportTrips);

module.exports = router;
