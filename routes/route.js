const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

// Route processing
router.post('/process-directions', routeController.processDirections);
router.post('/process-traffic-analysis', routeController.processTrafficAnalysis);
router.post('/process', routeController.processRoutes);

module.exports = router;
