const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ============ USER PROFILE MANAGEMENT ============
// Get all users (list endpoint)
router.get('/', userController.getAllUsers);
router.get('/all', userController.getAllUsers);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/profile/:userId', userController.getProfile);

// ============ USER PREFERENCES ============
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);
router.get('/preferences/:userId', userController.getPreferences);

// ============ PASSWORD MANAGEMENT ============
router.put('/change-password', userController.changePassword);
router.put('/change-password/:userId', userController.changePassword);

// ============ USER STATISTICS & ANALYTICS ============
router.get('/stats', userController.getUserStats);
router.get('/stats/:userId', userController.getUserStats);
router.get('/dashboard', userController.getDashboardData);
router.get('/dashboard/:userId', userController.getDashboardData);

// ============ USER ACTIVITY & LOGS ============
router.get('/activity', userController.getActivityLog);
router.get('/activity/:userId', userController.getActivityLog);

// ============ CACHE MANAGEMENT ============
router.get('/cache', userController.getCachedData);
router.put('/cache', userController.updateCachedData);
router.delete('/cache', userController.clearCache);
router.get('/cache/:userId', userController.getCachedData);

// ============ USER SETTINGS ============
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);
router.get('/settings/:userId', userController.getSettings);

// ============ USER NOTIFICATIONS ============
router.get('/notifications', userController.getNotifications);
router.put('/notifications/:notificationId/read', userController.markNotificationRead);
router.get('/notifications/:userId', userController.getNotifications);

// ============ USER DATA EXPORT ============
router.get('/export', userController.exportUserData);
router.get('/export/:userId', userController.exportUserData);

// ============ USER ACCOUNT MANAGEMENT ============
router.put('/deactivate', userController.deactivateAccount);
router.put('/deactivate/:userId', userController.deactivateAccount);
router.put('/reactivate', userController.reactivateAccount);
router.put('/reactivate/:userId', userController.reactivateAccount);
router.delete('/delete', userController.deleteAccount);
router.delete('/delete/:userId', userController.deleteAccount);

module.exports = router;
