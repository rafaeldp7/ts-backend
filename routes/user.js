const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// User routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.get('/preferences', authenticateToken, userController.getPreferences);
router.put('/preferences', authenticateToken, userController.updatePreferences);
router.get('/cache', authenticateToken, userController.getCachedData);
router.put('/cache', authenticateToken, userController.updateCachedData);
router.delete('/cache', authenticateToken, userController.clearCache);

module.exports = router;
