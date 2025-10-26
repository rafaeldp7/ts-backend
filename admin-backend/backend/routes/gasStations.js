const express = require('express');
const router = express.Router();
const {
  getGasStations,
  getGasStation,
  createGasStation,
  updateGasStation,
  deleteGasStation,
  updateFuelPrices,
  addReview,
  verifyGasStation,
  getGasStationsByBrand,
  getGasStationsByCity,
  getGasStationStats,
  getNearbyGasStations,
  archiveGasStation,
  getFuelPriceTrends,
  reverseGeocode,
  bulkReverseGeocodeStations,
  autoReverseGeocodeStation
} = require('../controllers/gasStationController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', getGasStations);
router.get('/nearby', getNearbyGasStations);
router.get('/brand/:brand', getGasStationsByBrand);
router.get('/city/:city', getGasStationsByCity);
router.get('/stats', getGasStationStats);
router.get('/reverse-geocode', reverseGeocode); // Public reverse geocoding endpoint
router.get('/:id', getGasStation);
router.get('/:id/price-trends', getFuelPriceTrends);

// Protected routes
router.post('/:id/reviews', authenticateToken, addReview);

// Admin routes
router.post('/', authenticateAdmin, createGasStation);
router.put('/:id', authenticateAdmin, updateGasStation);
router.delete('/:id', authenticateAdmin, deleteGasStation);
router.put('/:id/fuel-prices', authenticateAdmin, updateFuelPrices);
router.put('/:id/verify', authenticateAdmin, verifyGasStation);
router.put('/:id/archive', authenticateAdmin, archiveGasStation);
router.put('/:id/auto-reverse-geocode', authenticateAdmin, autoReverseGeocodeStation); // Auto-reverse geocode specific station
router.post('/bulk-reverse-geocode', authenticateAdmin, bulkReverseGeocodeStations); // Bulk reverse geocoding

module.exports = router;
