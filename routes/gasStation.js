const express = require('express');
const router = express.Router();
const gasStationController = require('../controllers/gasStationController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Gas station routes
router.get('/', authenticateToken, gasStationController.getGasStations);
router.get('/nearby', authenticateToken, gasStationController.getNearbyGasStations);
router.get('/:id', authenticateToken, gasStationController.getGasStation);
router.post('/', authenticateToken, gasStationController.createGasStation);
router.put('/:id', authenticateToken, gasStationController.updateGasStation);
router.delete('/:id', authenticateToken, gasStationController.deleteGasStation);
router.get('/:id/prices', authenticateToken, gasStationController.getGasStationPrices);
router.put('/:id/prices', authenticateToken, gasStationController.updateGasStationPrices);

module.exports = router;
