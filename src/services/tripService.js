import { apiService } from './apiService';

export const tripService = {
  // Get all trips
  async getTrips(page = 1, limit = 20, filters = {}) {
    return apiService.get('/trips', { page, limit, ...filters });
  },

  // Get trip by ID
  async getTripById(id) {
    return apiService.get(`/trips/${id}`);
  },

  // Get trip analytics
  async getTripAnalytics(period = '30d') {
    return apiService.get('/trips/analytics', { period });
  },

  // Get trip statistics
  async getTripStats() {
    return apiService.get('/trips/stats');
  },

  // Get user trips
  async getUserTrips(userId, page = 1, limit = 20) {
    return apiService.get(`/trips/user/${userId}`, { page, limit });
  },

  // Get trip routes
  async getTripRoutes() {
    return apiService.get('/trips/routes');
  },

  // Get popular routes
  async getPopularRoutes() {
    return apiService.get('/trips/popular-routes');
  },

  // Get trip performance
  async getTripPerformance() {
    return apiService.get('/trips/performance');
  }
};
