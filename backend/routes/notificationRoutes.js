const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/notifications
router.post('/', protect, notificationController.createNotification);

// GET /api/notifications/:userId
router.get('/:userId', protect, notificationController.getUserNotifications);

// PUT /api/notifications/read/:id
router.put('/read/:id', protect, notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete('/:id', protect, notificationController.deleteNotification);

module.exports = router;
