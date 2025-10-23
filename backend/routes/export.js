const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { protect } = require('../middleware/authMiddleware');

// Export routes
router.get('/users', protect, exportController.exportUsers);
router.get('/reports', protect, exportController.exportReports);
router.get('/gas-stations', protect, exportController.exportGasStations);
router.get('/trips', protect, exportController.exportTrips);

module.exports = router;
