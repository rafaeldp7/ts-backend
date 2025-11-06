const express = require('express');
const router = express.Router();
const gasStationController = require('../controllers/gasStationController');
const { protect } = require('../middlewares/authMiddleware');

// Gas station routes
router.get('/', gasStationController.getGasStations);
router.get('/nearby', gasStationController.getNearbyGasStations);
router.get('/:id', gasStationController.getGasStation);
router.post('/', gasStationController.createGasStation);
router.put('/:id', gasStationController.updateGasStation);
router.delete('/:id', gasStationController.deleteGasStation);
router.get('/:id/prices', gasStationController.getGasStationPrices);
router.put('/:id/prices', gasStationController.updateGasStationPrices);

// Price update routes (protected - requires authentication)
router.put('/:id/price', protect, gasStationController.updateGasPrice);
router.get('/:id/price-history', gasStationController.getPriceHistory);

module.exports = router;
