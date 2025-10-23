const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Data filtering and aggregation
router.post('/filter-aggregate', dataController.filterAndAggregate);
router.get('/aggregated', dataController.getAggregatedData);
router.get('/aggregated-cached', dataController.getAggregatedCachedData);

module.exports = router;
