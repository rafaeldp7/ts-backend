// services/adminSettingsService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

class AdminSettingsService {
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getDashboardSettings() {
    const response = await fetch(`${API_BASE_URL}/admin-settings/dashboard-settings`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async updateDashboardSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/admin-settings/dashboard-settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });

    const data = await response.json();
    return data;
  }

  async getSystemStats() {
    const response = await fetch(`${API_BASE_URL}/admin-settings/system-stats`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async getActivitySummary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin-settings/activity-summary?${queryString}`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async resetAdminPassword(adminId, newPassword) {
    const response = await fetch(`${API_BASE_URL}/admin-settings/reset-password/${adminId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });

    const data = await response.json();
    return data;
  }
}

export const adminSettingsService = new AdminSettingsService();
