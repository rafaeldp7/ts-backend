import { apiService } from './apiService';

export const notificationService = {
  // Get notifications
  async getNotifications(page = 1, limit = 20) {
    return apiService.get('/notifications', { page, limit });
  },

  // Get unread notifications count
  async getUnreadCount() {
    return apiService.get('/notifications/unread-count');
  },

  // Create notification
  async createNotification(notification) {
    return apiService.post('/notifications', notification);
  },

  // Mark as read
  async markAsRead(id) {
    return apiService.put(`/notifications/${id}/read`);
  },

  // Mark all as read
  async markAllAsRead() {
    return apiService.put('/notifications/mark-all-read');
  },

  // Delete notification
  async deleteNotification(id) {
    return apiService.delete(`/notifications/${id}`);
  },

  // Delete all notifications
  async deleteAllNotifications() {
    return apiService.delete('/notifications');
  },

  // Get notification settings
  async getNotificationSettings() {
    return apiService.get('/notifications/settings');
  },

  // Update notification settings
  async updateNotificationSettings(settings) {
    return apiService.put('/notifications/settings', settings);
  },

  // Send notification to user
  async sendToUser(userId, notification) {
    return apiService.post(`/notifications/send/${userId}`, notification);
  },

  // Send notification to all users
  async sendToAll(notification) {
    return apiService.post('/notifications/send-all', notification);
  },

  // Get notification templates
  async getTemplates() {
    return apiService.get('/notifications/templates');
  },

  // Create notification template
  async createTemplate(template) {
    return apiService.post('/notifications/templates', template);
  },

  // Update notification template
  async updateTemplate(id, template) {
    return apiService.put(`/notifications/templates/${id}`, template);
  },

  // Delete notification template
  async deleteTemplate(id) {
    return apiService.delete(`/notifications/templates/${id}`);
  }
};
