const express = require('express');
const router = express.Router();
const controller = require('../controllers/generalAnalyticsController');

// POST /api/general-analytics
router.post('/', controller.createOrUpdateAnalytics);

// GET /api/general-analytics
router.get('/', controller.getAllAnalytics);

// GET /api/general-analytics/:key
router.get('/:key', controller.getAnalyticsByKey);

module.exports = router;
