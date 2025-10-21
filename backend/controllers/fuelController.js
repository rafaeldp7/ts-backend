const FuelLog = require('../models/FuelLogModel');
const MaintenanceRecord = require('../models/MaintenanceRecord');
const cache = require('memory-cache');

class FuelController {
  // Get combined fuel data (fuel logs + maintenance refuels)
  async getCombinedFuelData(req, res) {
    try {
      const userId = req.user._id;
      const { period = '30d', motorId } = req.query;

      // Check cache first
      const cacheKey = `combined_fuel_${userId}_${period}_${motorId || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        console.log('[FuelController] Returning cached combined fuel data');
        return res.json(cached);
      }

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Build filters
      const fuelLogFilter = { userId, date: { $gte: startDate } };
      const maintenanceFilter = { 
        userId, 
        type: 'refuel', 
        timestamp: { $gte: startDate } 
      };
      
      if (motorId) {
        fuelLogFilter.motorId = motorId;
        maintenanceFilter.motorId = motorId;
      }

      // Fetch data in parallel
      const [fuelLogs, maintenanceRecords] = await Promise.all([
        FuelLog.find(fuelLogFilter)
          .populate('motorId', 'nickname brand model')
          .sort({ date: -1 }),
        MaintenanceRecord.find(maintenanceFilter)
          .populate('motorId', 'nickname brand model')
          .sort({ timestamp: -1 })
      ]);

      // Process maintenance refuels (server-side transformation)
      const maintenanceRefuels = maintenanceRecords.map(record => ({
        _id: `maintenance_${record._id}`,
        date: record.timestamp,
        liters: record.details.quantity,
        pricePerLiter: record.details.cost / record.details.quantity,
        totalCost: record.details.cost,
        odometer: record.odometer,
        notes: record.details.notes,
        motorId: {
          _id: record.motorId._id,
          nickname: record.motorId.nickname,
          brand: record.motorId.brand,
          model: record.motorId.model
        },
        location: record.location ? {
          latitude: record.location.latitude,
          longitude: record.location.longitude,
          address: record.location.address
        } : undefined,
        source: 'maintenance',
        type: 'refuel'
      }));

      // Process fuel logs
      const processedFuelLogs = fuelLogs.map(log => ({
        ...log.toObject(),
        source: 'fuel_log',
        type: 'refuel'
      }));

      // Combine and sort data
      const combinedData = [
        ...processedFuelLogs,
        ...maintenanceRefuels
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculate summary statistics
      const totalLiters = combinedData.reduce((sum, item) => sum + (item.liters || 0), 0);
      const totalCost = combinedData.reduce((sum, item) => sum + (item.totalCost || 0), 0);
      const avgCostPerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
      const totalRefuels = combinedData.length;

      const result = {
        data: combinedData,
        summary: {
          totalLiters,
          totalCost,
          avgCostPerLiter,
          totalRefuels,
          period,
          motorId: motorId || 'all'
        },
        metadata: {
          generatedAt: new Date(),
          cacheExpiry: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        }
      };

      // Cache for 5 minutes
      cache.put(cacheKey, result, 5 * 60 * 1000);
      
      console.log(`[FuelController] Processed ${combinedData.length} fuel records for user ${userId}`);
      res.json(result);

    } catch (error) {
      console.error('[FuelController] Error getting combined fuel data:', error);
      res.status(500).json({ 
        message: 'Server error getting combined fuel data',
        error: error.message 
      });
    }
  }

  // Get fuel efficiency analytics
  async getFuelEfficiencyAnalytics(req, res) {
    try {
      const userId = req.user._id;
      const { period = '30d', motorId } = req.query;

      // Check cache first
      const cacheKey = `fuel_efficiency_${userId}_${period}_${motorId || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Calculate date range
      const now = new Date();
      let startDate;
      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get combined fuel data
      const fuelData = await this.getCombinedFuelData(req, res);
      const combinedData = fuelData.data || [];

      // Calculate efficiency metrics
      const efficiencyData = combinedData.map(item => {
        const distance = item.distance || 0;
        const liters = item.liters || 0;
        return {
          date: item.date,
          distance,
          liters,
          efficiency: liters > 0 ? distance / liters : 0,
          cost: item.totalCost || 0,
          motorId: item.motorId?._id
        };
      }).filter(item => item.efficiency > 0);

      // Calculate statistics
      const totalDistance = efficiencyData.reduce((sum, item) => sum + item.distance, 0);
      const totalLiters = efficiencyData.reduce((sum, item) => sum + item.liters, 0);
      const avgEfficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;
      const totalCost = efficiencyData.reduce((sum, item) => sum + item.cost, 0);
      const avgCostPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;

      // Calculate efficiency trends
      const efficiencyTrends = efficiencyData
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
          date: item.date,
          efficiency: item.efficiency,
          distance: item.distance,
          cost: item.cost
        }));

      const result = {
        period,
        motorId: motorId || 'all',
        totalDistance,
        totalLiters,
        totalCost,
        avgEfficiency,
        avgCostPerKm,
        totalRefuels: efficiencyData.length,
        trends: efficiencyTrends,
        metadata: {
          generatedAt: new Date(),
          cacheExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      };

      // Cache for 10 minutes
      cache.put(cacheKey, result, 10 * 60 * 1000);
      
      res.json(result);

    } catch (error) {
      console.error('[FuelController] Error getting fuel efficiency analytics:', error);
      res.status(500).json({ 
        message: 'Server error getting fuel efficiency analytics',
        error: error.message 
      });
    }
  }

  // Get fuel cost analysis
  async getFuelCostAnalysis(req, res) {
    try {
      const userId = req.user._id;
      const { period = '30d', motorId } = req.query;

      // Check cache first
      const cacheKey = `fuel_cost_${userId}_${period}_${motorId || 'all'}`;
      const cached = cache.get(cacheKey);
      if (cached) {
        return res.json(cached);
      }

      // Get combined fuel data
      const fuelData = await this.getCombinedFuelData(req, res);
      const combinedData = fuelData.data || [];

      // Calculate cost analysis
      const costAnalysis = combinedData.map(item => ({
        date: item.date,
        cost: item.totalCost || 0,
        liters: item.liters || 0,
        pricePerLiter: item.pricePerLiter || 0,
        motorId: item.motorId?._id,
        location: item.location
      }));

      // Calculate statistics
      const totalCost = costAnalysis.reduce((sum, item) => sum + item.cost, 0);
      const totalLiters = costAnalysis.reduce((sum, item) => sum + item.liters, 0);
      const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
      const minPrice = Math.min(...costAnalysis.map(item => item.pricePerLiter));
      const maxPrice = Math.max(...costAnalysis.map(item => item.pricePerLiter));

      // Calculate cost trends
      const costTrends = costAnalysis
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map(item => ({
          date: item.date,
          cost: item.cost,
          pricePerLiter: item.pricePerLiter,
          liters: item.liters
        }));

      const result = {
        period,
        motorId: motorId || 'all',
        totalCost,
        totalLiters,
        avgPricePerLiter,
        minPrice,
        maxPrice,
        totalRefuels: costAnalysis.length,
        trends: costTrends,
        metadata: {
          generatedAt: new Date(),
          cacheExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        }
      };

      // Cache for 10 minutes
      cache.put(cacheKey, result, 10 * 60 * 1000);
      
      res.json(result);

    } catch (error) {
      console.error('[FuelController] Error getting fuel cost analysis:', error);
      res.status(500).json({ 
        message: 'Server error getting fuel cost analysis',
        error: error.message 
      });
    }
  }
}

module.exports = new FuelController();
