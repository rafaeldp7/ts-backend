const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// GET /api/notifications (public for testing)
router.get('/', notificationController.getAllNotifications);

// POST /api/notifications
router.post('/',  notificationController.createNotification);

// PUT /api/notifications/read/:id
router.put('/read/:id',  notificationController.markAsRead);

// GET /api/notifications/:userId
router.get('/:userId',  notificationController.getUserNotifications);

// DELETE /api/notifications/:id
router.delete('/:id',  notificationController.deleteNotification);

module.exports = router;
