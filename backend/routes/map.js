const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const { authenticateToken } = require('../middleware/auth');

// Map routes
router.post('/geocode', authenticateToken, mapController.geocodeAddress);
router.post('/reverse-geocode', authenticateToken, mapController.reverseGeocode);
router.post('/routes', authenticateToken, mapController.getRoutes);
router.post('/routes/optimize', authenticateToken, mapController.optimizeRoute);
router.get('/nearby', authenticateToken, mapController.getNearbyPlaces);
router.post('/snap-to-roads', authenticateToken, mapController.snapToRoads);
router.get('/traffic', authenticateToken, mapController.getTrafficData);
router.post('/directions', authenticateToken, mapController.getDirections);

module.exports = router;
