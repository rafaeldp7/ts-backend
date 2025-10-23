const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');


// Settings routes
router.get('/',  settingsController.getSettings);
router.put('/',  settingsController.updateSettings);
router.get('/theme',  settingsController.getThemeSettings);
router.put('/theme',  settingsController.updateThemeSettings);

module.exports = router;
