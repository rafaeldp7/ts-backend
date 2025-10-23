const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');

// Performance monitoring
router.post('/monitor', performanceController.processPerformanceMonitoring);

module.exports = router;
