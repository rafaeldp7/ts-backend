const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
// Google Maps API routes
router.post('/geocode', mapController.geocodeAddress);
router.post('/reverse-geocode', mapController.reverseGeocode);
router.post('/routes', mapController.getRoutes);
router.post('/directions', mapController.getDirections);

// Server-side clustering and analytics routes
router.get('/clustered-markers', mapController.getClusteredMarkers);
router.get('/statistics', mapController.getMapStatistics);
router.get('/nearby-gas-stations', mapController.getNearbyGasStations);

module.exports = router;
