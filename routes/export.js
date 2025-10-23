const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');


// Export routes
router.get('/users',  exportController.exportUsers);
router.get('/reports',  exportController.exportReports);
router.get('/gas-stations',  exportController.exportGasStations);
router.get('/trips',  exportController.exportTrips);

module.exports = router;
