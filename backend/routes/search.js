const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { authenticateToken } = require('../middleware/auth');

// Search routes
router.get('/users', authenticateToken, searchController.searchUsers);
router.get('/reports', authenticateToken, searchController.searchReports);
router.get('/gas-stations', authenticateToken, searchController.searchGasStations);
router.get('/motorcycles', authenticateToken, searchController.searchMotorcycles);
router.get('/trips', authenticateToken, searchController.searchTrips);

module.exports = router;
