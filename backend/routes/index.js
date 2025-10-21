const express = require('express');
const router = express.Router();

// Import existing route modules
const authRoutes = require('./auth');
const userRoutes = require('./user');
const motorRoutes = require('./motor');
const reportRoutes = require('./report');
const gasStationRoutes = require('./gasStation');
const tripRoutes = require('./trip');
const maintenanceRoutes = require('./maintenance');
const analyticsRoutes = require('./analytics');
const mapRoutes = require('./map');

// Import new route modules from root level
const fuelLogRoutes = require('./fuelLogRoutes');
const fuelRoutes = require('./fuelRoutes');
const notificationRoutes = require('./notificationRoutes');
const savedDestinationRoutes = require('./savedDestinationRoutes');
const dailyAnalyticsRoutes = require('./dailyAnalyticsRoutes');
const fuelStatsRoutes = require('./fuelStatsRoutes');
const generalAnalyticsRoutes = require('./generalAnalyticsRoutes');
const leaderboardsAnalyticsRoutes = require('./leaderboardsAnalyticsRoutes');

// Mount existing routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/motors', motorRoutes);
router.use('/reports', reportRoutes);
router.use('/gas-stations', gasStationRoutes);
router.use('/trips', tripRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/map', mapRoutes);

// Mount new routes
router.use('/fuel-logs', fuelLogRoutes);
router.use('/fuel', fuelRoutes);
router.use('/notifications', notificationRoutes);
router.use('/saved-destinations', savedDestinationRoutes);
router.use('/daily-analytics', dailyAnalyticsRoutes);
router.use('/fuel-stats', fuelStatsRoutes);
router.use('/general-analytics', generalAnalyticsRoutes);
router.use('/leaderboard-analytics', leaderboardsAnalyticsRoutes);

module.exports = router;