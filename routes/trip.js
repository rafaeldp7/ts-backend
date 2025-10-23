const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Trip routes
router.get('/', authenticateToken, tripController.getTrips);
router.get('/:id', authenticateToken, tripController.getTrip);
router.post('/', authenticateToken, tripController.createTrip);
router.put('/:id', authenticateToken, tripController.updateTrip);
router.delete('/:id', authenticateToken, tripController.deleteTrip);
router.get('/:id/analytics', authenticateToken, tripController.getTripAnalytics);
router.post('/:id/complete', authenticateToken, tripController.completeTrip);
router.post('/:id/cancel', authenticateToken, tripController.cancelTrip);
router.get('/:id/route', authenticateToken, tripController.getTripRoute);
router.put('/:id/route', authenticateToken, tripController.updateTripRoute);

module.exports = router;
