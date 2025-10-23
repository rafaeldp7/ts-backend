const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect } = require('../middlewares/authMiddleware');

// Search routes
router.get('/users', protect, searchController.searchUsers);
router.get('/reports', protect, searchController.searchReports);
router.get('/gas-stations', protect, searchController.searchGasStations);
router.get('/motorcycles', protect, searchController.searchMotorcycles);
router.get('/trips', protect, searchController.searchTrips);

module.exports = router;
