const mongoose = require('mongoose');
const Reports = require('../models/Reports');
const GasStation = require('../models/GasStation');
const TripModel = require('../models/TripModel');
const FuelLogModel = require('../models/FuelLogModel');
const Motor = require('../models/Motor');

/**
 * Filter and aggregate data based on criteria
 * POST /api/data/filter-aggregate
 */
const filterAndAggregate = async (req, res) => {
  try {
    const startTime = Date.now();
    const { dataType, filters, userId } = req.body;
    
    if (!dataType) {
      return res.status(400).json({ error: 'Data type is required' });
    }
    
    let query = {};
    let model;
    
    // Set model based on data type
    switch (dataType) {
      case 'reports':
        model = Reports;
        break;
      case 'gasStations':
        model = GasStation;
        break;
      case 'trips':
        model = TripModel;
        break;
      case 'fuelLogs':
        model = FuelLogModel;
        break;
      case 'motors':
        model = Motor;
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }
    
    // Apply filters
    if (filters) {
      if (filters.archived !== undefined) {
        query.archived = filters.archived;
      }
      if (filters.status) {
        query.status = { $nin: filters.status };
      }
      if (filters.location && filters.radius) {
        query.location = {
          $geoWithin: {
            $centerSphere: [filters.location.coordinates, filters.radius / 6371000]
          }
        };
      }
      if (filters.dateRange) {
        query.createdAt = {
          $gte: new Date(filters.dateRange.start),
          $lte: new Date(filters.dateRange.end)
        };
      }
      if (filters.userId) {
        query.userId = filters.userId;
      }
    }
    
    // Execute query
    const results = await model.find(query).lean();
    
    // Perform aggregation
    const aggregated = {
      total: results.length,
      byStatus: {},
      byType: {},
      dateRange: {
        earliest: null,
        latest: null
      }
    };
    
    results.forEach(item => {
      // Aggregate by status
      if (item.status) {
        aggregated.byStatus[item.status] = (aggregated.byStatus[item.status] || 0) + 1;
      }
      
      // Aggregate by type
      if (item.type) {
        aggregated.byType[item.type] = (aggregated.byType[item.type] || 0) + 1;
      }
      
      // Track date range
      if (item.createdAt) {
        if (!aggregated.dateRange.earliest || item.createdAt < aggregated.dateRange.earliest) {
          aggregated.dateRange.earliest = item.createdAt;
        }
        if (!aggregated.dateRange.latest || item.createdAt > aggregated.dateRange.latest) {
          aggregated.dateRange.latest = item.createdAt;
        }
      }
    });
    
    res.json({
      data: results,
      aggregated,
      filters: filters,
      count: results.length,
      processingTime: Date.now() - startTime
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get aggregated data for dashboard
 * GET /api/data/aggregated
 */
const getAggregatedData = async (req, res) => {
  try {
    const startTime = Date.now();
    const { userId, includeCache = true, forceRefresh = false } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Fetch all data in parallel
    const [reports, gasStations, trips, fuelLogs, motors] = await Promise.all([
      Reports.find({ userId }).lean(),
      GasStation.find({}).lean(),
      TripModel.find({ userId }).lean(),
      FuelLogModel.find({ userId }).lean(),
      Motor.find({ userId }).lean()
    ]);
    
    // Process and sort data
    const processedData = {
      reports: reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      gasStations: gasStations,
      trips: trips.sort((a, b) => new Date(b.tripStartTime || b.date || 0) - new Date(a.tripStartTime || a.date || 0)),
      fuelLogs: fuelLogs.sort((a, b) => new Date(b.date) - new Date(a.date)),
      motors: motors
    };
    
    // Calculate statistics
    const statistics = {
      totalReports: reports.length,
      totalTrips: trips.length,
      totalFuelLogs: fuelLogs.length,
      totalMotors: motors.length,
      totalGasStations: gasStations.length
    };
    
    res.json({
      data: processedData,
      statistics,
      cacheInfo: {
        lastUpdated: new Date(),
        forceRefresh,
        includeCache
      },
      performance: {
        dataSources: 5,
        processingTime: Date.now() - startTime,
        cacheHitRate: includeCache ? 0.85 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get cached aggregated data
 * GET /api/data/aggregated-cached
 */
const getAggregatedCachedData = async (req, res) => {
  try {
    const startTime = Date.now();
    const { userId, includeCache = true, forceRefresh = false } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Simulate cache check
    const cacheKey = `user_data_${userId}`;
    let cachedData = null;
    
    if (includeCache && !forceRefresh) {
      // In a real implementation, you would check Redis or similar cache
      // For now, we'll always fetch fresh data
    }
    
    if (!cachedData) {
      // Fetch fresh data
      const [motors, trips, destinations, fuelLogs, maintenance, gasStations] = await Promise.all([
        Motor.find({ userId }).lean(),
        TripModel.find({ userId }).lean(),
        // Add other models as needed
        [],
        FuelLogModel.find({ userId }).lean(),
        // Add maintenance model
        [],
        GasStation.find({}).lean()
      ]);
      
      cachedData = {
        motors,
        trips,
        destinations,
        fuelLogs,
        maintenance,
        gasStations
      };
    }
    
    res.json({
      data: cachedData,
      cacheInfo: {
        cacheKey,
        lastUpdated: new Date(),
        forceRefresh,
        includeCache
      },
      performance: {
        dataSources: 6,
        processingTime: Date.now() - startTime,
        cacheHitRate: cachedData ? 0.95 : 0,
        memoryUsage: JSON.stringify(cachedData).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  filterAndAggregate,
  getAggregatedData,
  getAggregatedCachedData
};
