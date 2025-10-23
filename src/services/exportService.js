import { apiService } from './apiService';

export const exportService = {
  // Export users
  async exportUsers(format = 'csv', filters = {}) {
    const filename = `users.${format}`;
    return apiService.downloadFile(`/export/users?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export reports
  async exportReports(format = 'csv', filters = {}) {
    const filename = `reports.${format}`;
    return apiService.downloadFile(`/export/reports?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export gas stations
  async exportGasStations(format = 'csv', filters = {}) {
    const filename = `gas-stations.${format}`;
    return apiService.downloadFile(`/export/gas-stations?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export trips
  async exportTrips(format = 'csv', filters = {}) {
    const filename = `trips.${format}`;
    return apiService.downloadFile(`/export/trips?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export motorcycles
  async exportMotorcycles(format = 'csv', filters = {}) {
    const filename = `motorcycles.${format}`;
    return apiService.downloadFile(`/export/motorcycles?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export fuel logs
  async exportFuelLogs(format = 'csv', filters = {}) {
    const filename = `fuel-logs.${format}`;
    return apiService.downloadFile(`/export/fuel-logs?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export maintenance records
  async exportMaintenance(format = 'csv', filters = {}) {
    const filename = `maintenance.${format}`;
    return apiService.downloadFile(`/export/maintenance?format=${format}&${new URLSearchParams(filters)}`, filename);
  },

  // Export analytics data
  async exportAnalytics(format = 'csv', period = '30d') {
    const filename = `analytics-${period}.${format}`;
    return apiService.downloadFile(`/export/analytics?format=${format}&period=${period}`, filename);
  },

  // Export dashboard data
  async exportDashboard(format = 'csv') {
    const filename = `dashboard.${format}`;
    return apiService.downloadFile(`/export/dashboard?format=${format}`, filename);
  },

  // Export all data (admin only)
  async exportAllData(format = 'csv') {
    const filename = `complete-data.${format}`;
    return apiService.downloadFile(`/export/all?format=${format}`, filename);
  },

  // Get export status
  async getExportStatus(exportId) {
    return apiService.get(`/export/status/${exportId}`);
  },

  // Get export history
  async getExportHistory() {
    return apiService.get('/export/history');
  }
};
