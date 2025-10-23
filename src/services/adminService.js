// services/adminService.js - Updated to use correct admin management endpoints
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://ts-backend-1-jyit.onrender.com/api';

class AdminService {
  getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // FIXED: Use correct admin management endpoints
  async getAdmins(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin-management/admins?${queryString}`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async getAdmin(id) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admins/${id}`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  // FIXED: Use correct form data structure
  async createAdmin(adminData) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admins`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(adminData)
    });

    const data = await response.json();
    return data;
  }

  async updateAdmin(id, adminData) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admins/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(adminData)
    });

    const data = await response.json();
    return data;
  }

  async updateAdminRole(id, roleId) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admins/${id}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ roleId })
    });

    const data = await response.json();
    return data;
  }

  async deactivateAdmin(id) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admins/${id}/deactivate`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async activateAdmin(id) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admins/${id}/activate`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async getAdminRoles() {
    const response = await fetch(`${API_BASE_URL}/admin-management/admin-roles`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async createAdminRole(roleData) {
    const response = await fetch(`${API_BASE_URL}/admin-management/admin-roles`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(roleData)
    });

    const data = await response.json();
    return data;
  }

  async getAdminLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin-management/admin-logs?${queryString}`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }

  async getMyAdminLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/admin-management/my-admin-logs?${queryString}`, {
      headers: this.getAuthHeaders()
    });

    const data = await response.json();
    return data;
  }
}

export const adminService = new AdminService();
