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
  getFuelPriceTrends
} = require('../controllers/gasStationController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', getGasStations);
router.get('/nearby', getNearbyGasStations);
router.get('/brand/:brand', getGasStationsByBrand);
router.get('/city/:city', getGasStationsByCity);
router.get('/stats', getGasStationStats);
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

module.exports = router;
