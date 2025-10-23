const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

// Permission management
router.post('/location-management', permissionController.manageLocationPermissions);

module.exports = router;
