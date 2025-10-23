const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cacheController');

// Cache analytics
router.get('/cache-performance', cacheController.getCacheAnalytics);
router.post('/predictive-analysis', cacheController.analyzePredictivePatterns);

module.exports = router;
