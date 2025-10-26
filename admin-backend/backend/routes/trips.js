const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
  getUserTrips,
  getTripsByDateRange,
  getPaginatedTrips,
  getTripAnalytics,
  getMonthlyTripSummary,
  getTopUsersByTripCount,
  getMostUsedMotors,
  addRoutePoint,
  addExpense
} = require('../controllers/tripController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes
router.get('/', getTrips);
router.get('/paginate', getPaginatedTrips);
router.get('/analytics/summary', getTripAnalytics);
router.get('/analytics/monthly', getMonthlyTripSummary);
router.get('/insights/top-users', getTopUsersByTripCount);
router.get('/insights/top-motors', getMostUsedMotors);

// Protected routes
router.get('/user/:userId', authenticateToken, getUserTrips);
router.get('/date-range', getTripsByDateRange);
router.get('/:id', authenticateToken, getTrip);
router.post('/', authenticateToken, createTrip);
router.put('/:id', authenticateAdmin, updateTrip);
router.delete('/:id', authenticateAdmin, deleteTrip);
router.post('/:id/route-points', authenticateToken, addRoutePoint);
router.post('/:id/expenses', authenticateToken, addExpense);

module.exports = router;
