const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
// User routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);
router.get('/cache', userController.getCachedData);
router.put('/cache', userController.updateCachedData);
router.delete('/cache', userController.clearCache);

module.exports = router;
