import { apiService } from './apiService';

export const settingsService = {
  // Get settings
  async getSettings() {
    return apiService.get('/settings');
  },

  // Update settings
  async updateSettings(settings) {
    return apiService.put('/settings', settings);
  },

  // Get theme settings
  async getThemeSettings() {
    return apiService.get('/settings/theme');
  },

  // Update theme settings
  async updateThemeSettings(theme) {
    return apiService.put('/settings/theme', theme);
  },

  // Get notification settings
  async getNotificationSettings() {
    return apiService.get('/settings/notifications');
  },

  // Update notification settings
  async updateNotificationSettings(settings) {
    return apiService.put('/settings/notifications', settings);
  },

  // Get user preferences
  async getUserPreferences() {
    return apiService.get('/settings/preferences');
  },

  // Update user preferences
  async updateUserPreferences(preferences) {
    return apiService.put('/settings/preferences', preferences);
  },

  // Get system configuration
  async getSystemConfiguration() {
    return apiService.get('/settings/system');
  },

  // Update system configuration
  async updateSystemConfiguration(config) {
    return apiService.put('/settings/system', config);
  },

  // Reset settings to default
  async resetToDefault() {
    return apiService.post('/settings/reset');
  },

  // Export settings
  async exportSettings() {
    return apiService.get('/settings/export');
  },

  // Import settings
  async importSettings(settingsData) {
    return apiService.post('/settings/import', settingsData);
  }
};
