const User = require('../models/User');
const Report = require('../models/Report');
const GasStation = require('../models/GasStation');
const Trip = require('../models/Trip');
const fs = require('fs');
const path = require('path');

class ExportController {
  // Export users to CSV
  async exportUsers(req, res) {
    try {
      const { format = 'csv' } = req.query;
      
      const users = await User.find()
        .select('-password')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        const csvData = this.convertToCSV(users, [
          '_id', 'firstName', 'lastName', 'email', 'phone', 'role', 'isActive', 'createdAt'
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
        res.send(csvData);
      } else {
        res.json({ users });
      }
    } catch (error) {
      console.error('Error exporting users:', error);
      res.status(500).json({ 
        error: 'Failed to export users',
        message: error.message 
      });
    }
  }

  // Export reports to CSV
  async exportReports(req, res) {
    try {
      const { format = 'csv' } = req.query;
      
      const reports = await Report.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        const csvData = this.convertToCSV(reports, [
          '_id', 'title', 'type', 'status', 'isVerified', 'userId.firstName', 'userId.lastName', 'location.barangay', 'createdAt'
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reports.csv');
        res.send(csvData);
      } else {
        res.json({ reports });
      }
    } catch (error) {
      console.error('Error exporting reports:', error);
      res.status(500).json({ 
        error: 'Failed to export reports',
        message: error.message 
      });
    }
  }

  // Export gas stations to CSV
  async exportGasStations(req, res) {
    try {
      const { format = 'csv' } = req.query;
      
      const gasStations = await GasStation.find()
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        const csvData = this.convertToCSV(gasStations, [
          '_id', 'name', 'brand', 'location.barangay', 'location.city', 'fuelPrices', 'createdAt'
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=gas-stations.csv');
        res.send(csvData);
      } else {
        res.json({ gasStations });
      }
    } catch (error) {
      console.error('Error exporting gas stations:', error);
      res.status(500).json({ 
        error: 'Failed to export gas stations',
        message: error.message 
      });
    }
  }

  // Export trips to CSV
  async exportTrips(req, res) {
    try {
      const { format = 'csv' } = req.query;
      
      const trips = await Trip.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      if (format === 'csv') {
        const csvData = this.convertToCSV(trips, [
          '_id', 'userId.firstName', 'userId.lastName', 'startLocation.barangay', 'endLocation.barangay', 'distance', 'duration', 'createdAt'
        ]);
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=trips.csv');
        res.send(csvData);
      } else {
        res.json({ trips });
      }
    } catch (error) {
      console.error('Error exporting trips:', error);
      res.status(500).json({ 
        error: 'Failed to export trips',
        message: error.message 
      });
    }
  }

  // Convert data to CSV format
  convertToCSV(data, fields) {
    if (!data || data.length === 0) return '';
    
    // Create header row
    const headers = fields.join(',');
    
    // Create data rows
    const rows = data.map(item => {
      return fields.map(field => {
        const value = this.getNestedValue(item, field);
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });
    
    return [headers, ...rows].join('\n');
  }

  // Get nested object value
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : '';
    }, obj);
  }
}

module.exports = new ExportController();
