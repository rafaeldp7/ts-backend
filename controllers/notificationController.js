const Notification = require('../models/Notification');

// 📄 Get all notifications (public for testing)
exports.getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error getting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting notifications'
    });
  }
};

// 📥 Create new notification
exports.createNotification = async (req, res) => {
  try {
    const { userId, message, type } = req.body;
    const notif = await Notification.create({ userId, message, type });
    res.status(201).json({ msg: "Notification created", notif });
  } catch (err) {
    res.status(500).json({ msg: "Failed to create", error: err.message });
  }
};

// 📤 Get all notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifs = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(notifs);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed", error: err.message });
  }
};

// ✅ Mark as read
exports.markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ msg: "Notification not found" });
    res.status(200).json({ msg: "Marked as read", notif });
  } catch (err) {
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
};

// ❌ Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Not found" });
    res.status(200).json({ msg: "Deleted", deleted });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed", error: err.message });
  }
};
