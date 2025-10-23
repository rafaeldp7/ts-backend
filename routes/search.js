const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');


// Search routes
router.get('/users',  searchController.searchUsers);
router.get('/reports',  searchController.searchReports);
router.get('/gas-stations',  searchController.searchGasStations);
router.get('/motorcycles',  searchController.searchMotorcycles);
router.get('/trips',  searchController.searchTrips);

module.exports = router;
