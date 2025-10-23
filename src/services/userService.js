import { apiService } from './apiService';

export const userService = {
  // Get all users
  async getUsers(page = 1, limit = 20, filters = {}) {
    return apiService.get('/users', { page, limit, ...filters });
  },

  // Get user by ID
  async getUserById(id) {
    return apiService.get(`/users/${id}`);
  },

  // Create user
  async createUser(userData) {
    return apiService.post('/users', userData);
  },

  // Update user
  async updateUser(id, userData) {
    return apiService.put(`/users/${id}`, userData);
  },

  // Delete user
  async deleteUser(id) {
    return apiService.delete(`/users/${id}`);
  },

  // Get user statistics
  async getUserStats() {
    return apiService.get('/users/stats');
  },

  // Get user activity
  async getUserActivity(id) {
    return apiService.get(`/users/${id}/activity`);
  },

  // Block user
  async blockUser(id) {
    return apiService.put(`/users/${id}/block`);
  },

  // Unblock user
  async unblockUser(id) {
    return apiService.put(`/users/${id}/unblock`);
  },

  // Get user trips
  async getUserTrips(id, page = 1, limit = 20) {
    return apiService.get(`/users/${id}/trips`, { page, limit });
  },

  // Get user motorcycles
  async getUserMotorcycles(id) {
    return apiService.get(`/users/${id}/motorcycles`);
  }
};
