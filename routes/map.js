const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Map processing
router.post('/cluster-markers', mapController.clusterMarkers);
router.post('/process-markers', mapController.processMarkers);
router.post('/apply-filters', mapController.applyMapFilters);
router.post('/snap-to-roads', mapController.snapToRoads);

module.exports = router;