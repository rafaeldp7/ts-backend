import { apiService } from './apiService';

export const geographyService = {
  // Get all geography data
  async getGeographyData() {
    return apiService.get('/geography');
  },

  // Get barangay data
  async getBarangayData(barangay) {
    return apiService.get(`/geography/barangay/${barangay}`);
  },

  // Get geography statistics
  async getStatistics() {
    return apiService.get('/geography/statistics');
  },

  // Get user distribution by location
  async getUserDistribution() {
    return apiService.get('/geography/user-distribution');
  },

  // Get trip analytics by location
  async getTripAnalyticsByLocation() {
    return apiService.get('/geography/trip-analytics');
  },

  // Get gas station distribution
  async getGasStationDistribution() {
    return apiService.get('/geography/gas-station-distribution');
  },

  // Get traffic hotspots
  async getTrafficHotspots() {
    return apiService.get('/geography/traffic-hotspots');
  },

  // Get route analytics
  async getRouteAnalytics() {
    return apiService.get('/geography/route-analytics');
  },

  // Get location-based insights
  async getLocationInsights() {
    return apiService.get('/geography/insights');
  }
};
