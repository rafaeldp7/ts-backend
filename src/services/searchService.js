import { apiService } from './apiService';

export const searchService = {
  // Search users
  async searchUsers(query, page = 1, limit = 20) {
    return apiService.get('/search/users', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Search reports
  async searchReports(query, page = 1, limit = 20) {
    return apiService.get('/search/reports', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Search gas stations
  async searchGasStations(query, page = 1, limit = 20) {
    return apiService.get('/search/gas-stations', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Search motorcycles
  async searchMotorcycles(query, page = 1, limit = 20) {
    return apiService.get('/search/motorcycles', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Search trips
  async searchTrips(query, page = 1, limit = 20) {
    return apiService.get('/search/trips', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Search maintenance records
  async searchMaintenance(query, page = 1, limit = 20) {
    return apiService.get('/search/maintenance', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Search fuel logs
  async searchFuelLogs(query, page = 1, limit = 20) {
    return apiService.get('/search/fuel-logs', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Global search across all entities
  async globalSearch(query, page = 1, limit = 20) {
    return apiService.get('/search/global', { 
      q: query, 
      page, 
      limit 
    });
  },

  // Get search suggestions
  async getSearchSuggestions(query) {
    return apiService.get('/search/suggestions', { q: query });
  },

  // Get recent searches
  async getRecentSearches() {
    return apiService.get('/search/recent');
  },

  // Save search
  async saveSearch(query, filters = {}) {
    return apiService.post('/search/save', { query, filters });
  }
};
