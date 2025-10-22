const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticateToken } = require('../middleware/auth');

// Settings routes
router.get('/', authenticateToken, settingsController.getSettings);
router.put('/', authenticateToken, settingsController.updateSettings);
router.get('/theme', authenticateToken, settingsController.getThemeSettings);
router.put('/theme', authenticateToken, settingsController.updateThemeSettings);

module.exports = router;
