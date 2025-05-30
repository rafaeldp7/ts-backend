const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");

// POST /api/notifications
router.post("/", notificationController.createNotification);

// GET /api/notifications/:userId
router.get("/:userId", notificationController.getUserNotifications);

// PUT /api/notifications/read/:id
router.put("/read/:id", notificationController.markAsRead);

// DELETE /api/notifications/:id
router.delete("/:id", notificationController.deleteNotification);

module.exports = router;
