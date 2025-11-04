const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// ============ USER PROFILE MANAGEMENT ============
// Get all users (list endpoint)
router.get('/', userController.getAllUsers);
router.get('/all', userController.getAllUsers);

// Get current logged-in user data (use this after login) - PROTECTED
router.get('/me', protect, userController.getCurrentUser);
router.get('/current', protect, userController.getCurrentUser);

// Get complete user data with all related information (trips, fuel logs, maintenance, etc.) - PROTECTED
router.get('/complete', protect, userController.getCompleteUserData);
router.get('/complete/:userId', protect, userController.getCompleteUserData);
router.get('/full-data', protect, userController.getCompleteUserData);

router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.get('/profile/:userId', protect, userController.getProfile);

// ============ USER PREFERENCES ============
router.get('/preferences', protect, userController.getPreferences);
router.put('/preferences', protect, userController.updatePreferences);
router.get('/preferences/:userId', protect, userController.getPreferences);

// ============ PASSWORD MANAGEMENT ============
router.put('/change-password', protect, userController.changePassword);
router.put('/change-password/:userId', protect, userController.changePassword);

// ============ USER STATISTICS & ANALYTICS ============
router.get('/stats', protect, userController.getUserStats);
router.get('/stats/:userId', protect, userController.getUserStats);
router.get('/dashboard', protect, userController.getDashboardData);
router.get('/dashboard/:userId', protect, userController.getDashboardData);

// ============ USER ACTIVITY & LOGS ============
router.get('/activity', protect, userController.getActivityLog);
router.get('/activity/:userId', protect, userController.getActivityLog);

// ============ CACHE MANAGEMENT ============
router.get('/cache', protect, userController.getCachedData);
router.put('/cache', protect, userController.updateCachedData);
router.delete('/cache', protect, userController.clearCache);
router.get('/cache/:userId', protect, userController.getCachedData);

// ============ USER SETTINGS ============
router.get('/settings', protect, userController.getSettings);
router.put('/settings', protect, userController.updateSettings);
router.get('/settings/:userId', protect, userController.getSettings);

// ============ USER NOTIFICATIONS ============
router.get('/notifications', protect, userController.getNotifications);
router.put('/notifications/:notificationId/read', protect, userController.markNotificationRead);
router.get('/notifications/:userId', protect, userController.getNotifications);

// ============ USER DATA EXPORT ============
router.get('/export', protect, userController.exportUserData);
router.get('/export/:userId', protect, userController.exportUserData);

// ============ USER ACCOUNT MANAGEMENT ============
router.put('/deactivate', protect, userController.deactivateAccount);
router.put('/deactivate/:userId', protect, userController.deactivateAccount);
router.put('/reactivate', protect, userController.reactivateAccount);
router.put('/reactivate/:userId', protect, userController.reactivateAccount);
router.delete('/delete', protect, userController.deleteAccount);
router.delete('/delete/:userId', protect, userController.deleteAccount);

module.exports = router;
