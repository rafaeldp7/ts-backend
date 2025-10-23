import { apiService } from './apiService';

export const analyticsService = {
  // Get general analytics
  async getGeneralAnalytics(period = '30d') {
    return apiService.get('/general-analytics', { period });
  },

  // Get daily analytics
  async getDailyAnalytics(date) {
    return apiService.get('/daily-analytics', { date });
  },

  // Get fuel statistics
  async getFuelStats(period = '30d') {
    return apiService.get('/fuel-stats', { period });
  },

  // Get leaderboard analytics
  async getLeaderboardAnalytics() {
    return apiService.get('/leaderboard-analytics');
  },

  // Get performance metrics
  async getPerformanceMetrics() {
    return apiService.get('/analytics/performance');
  },

  // Get user engagement
  async getUserEngagement() {
    return apiService.get('/analytics/engagement');
  },

  // Get system metrics
  async getSystemMetrics() {
    return apiService.get('/analytics/system');
  }
};
