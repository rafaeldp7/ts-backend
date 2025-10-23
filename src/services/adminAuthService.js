// services/adminAuthService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

class AdminAuthService {
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/admin-auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    return data;
  }

  async logout() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin-auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    return data;
  }

  async getProfile() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    return data;
  }

  async updateProfile(profileData) {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin-auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });

    const data = await response.json();
    return data;
  }

  async changePassword(currentPassword, newPassword) {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin-auth/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await response.json();
    return data;
  }

  async verifyToken() {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/admin-auth/verify-token`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    return data;
  }
}

export const adminAuthService = new AdminAuthService();
