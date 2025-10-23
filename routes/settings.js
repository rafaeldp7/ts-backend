const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middlewares/authMiddleware');

// Settings routes
router.get('/', protect, settingsController.getSettings);
router.put('/', protect, settingsController.updateSettings);
router.get('/theme', protect, settingsController.getThemeSettings);
router.put('/theme', protect, settingsController.updateThemeSettings);

module.exports = router;
