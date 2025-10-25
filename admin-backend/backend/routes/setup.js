const express = require('express');
const router = express.Router();
const setupController = require('../controllers/setupController');

// Setup routes (no authentication required - for first admin creation)
router.get('/status', setupController.checkSetupStatus);
router.get('/roles', setupController.getAvailableRoles);
router.post('/first-admin', setupController.createFirstAdmin);

module.exports = router;
