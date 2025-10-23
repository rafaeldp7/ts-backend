const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');
// Trip routes
router.get('/', tripController.getTrips);
router.get('/:id', tripController.getTrip);
router.post('/', tripController.createTrip);
router.put('/:id', tripController.updateTrip);
router.delete('/:id', tripController.deleteTrip);
router.get('/:id/analytics', tripController.getTripAnalytics);
router.post('/:id/complete', tripController.completeTrip);
router.post('/:id/cancel', tripController.cancelTrip);
router.get('/:id/route', tripController.getTripRoute);
router.put('/:id/route', tripController.updateTripRoute);

module.exports = router;
