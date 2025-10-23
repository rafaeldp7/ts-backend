import { apiService } from './apiService';

export const dashboardService = {
  // Get dashboard overview
  async getOverview() {
    return apiService.get('/dashboard/overview');
  },

  // Get dashboard statistics
  async getStats() {
    return apiService.get('/dashboard/stats');
  },

  // Get dashboard analytics
  async getAnalytics(period = '30d') {
    return apiService.get('/dashboard/analytics', { period });
  },

  // Get user count
  async getUserCount() {
    return apiService.get('/auth/user-count');
  },

  // Get new users this month
  async getNewUsersThisMonth() {
    return apiService.get('/auth/new-users-this-month');
  },

  // Get user growth data
  async getUserGrowth() {
    return apiService.get('/auth/user-growth');
  },

  // Get first user name
  async getFirstUserName() {
    return apiService.get('/auth/first-user-name');
  },

  // Get gas consumption data
  async getGasConsumption() {
    return apiService.get('/gas-sessions/gasConsumption');
  },

  // Get total trips count
  async getTotalTrips() {
    return apiService.get('/gas-sessions/');
  },

  // Get performance metrics
  async getPerformanceMetrics() {
    return apiService.get('/dashboard/performance');
  },

  // Get system health
  async getSystemHealth() {
    return apiService.get('/dashboard/health');
  }
};
