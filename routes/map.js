const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Google Maps API routes
router.post('/geocode', authenticateToken, mapController.geocodeAddress);
router.post('/reverse-geocode', authenticateToken, mapController.reverseGeocode);
router.post('/routes', authenticateToken, mapController.getRoutes);
router.post('/directions', authenticateToken, mapController.getDirections);

// Server-side clustering and analytics routes
router.get('/clustered-markers', authenticateToken, mapController.getClusteredMarkers);
router.get('/statistics', authenticateToken, mapController.getMapStatistics);
router.get('/nearby-gas-stations', authenticateToken, mapController.getNearbyGasStations);

module.exports = router;
