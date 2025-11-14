const FuelLog = require('../models/FuelLogModel');
const Trip = require('../models/TripModel');
const UserMotor = require('../models/userMotorModel');

// GET: Fuel stats (min, max, average) for a given motor
// Also returns: totalLiters, totalCost, averagePrice, averageEfficiency, totalDistance
exports.getFuelStatsByMotor = async (req, res) => {
  try {
    const { motorId } = req.params;

    const logs = await FuelLog.find({ motorId });
    
    // Get motor analytics for efficiency and distance
    const motor = await UserMotor.findById(motorId);
    const motorAnalytics = motor?.analytics || {};
    
    // Get trips for distance calculation
    const trips = await Trip.find({ motorId, status: 'completed' });

    // Calculate fuel log statistics
    if (!logs.length) {
      // Return empty stats but still include efficiency/distance from motor analytics
      return res.status(200).json({
        motorId,
        totalLiters: 0,
        totalCost: 0,
        averagePrice: 0,
        averageEfficiency: motorAnalytics.totalDistance > 0 && motorAnalytics.totalFuelUsed > 0
          ? parseFloat((motorAnalytics.totalDistance / motorAnalytics.totalFuelUsed).toFixed(2))
          : 0,
        totalDistance: motorAnalytics.totalDistance || 0,
        totalLogs: 0,
        fuelStats: {
          average: 0,
          min: 0,
          max: 0
        }
      });
    }

    const litersArray = logs.map((log) => log.liters);
    const totalLiters = litersArray.reduce((a, b) => a + b, 0);
    const average = totalLiters / litersArray.length;
    const min = Math.min(...litersArray);
    const max = Math.max(...litersArray);

    // Calculate total cost
    const totalCost = logs.reduce((sum, log) => sum + (log.totalCost || 0), 0);

    // Calculate average price per liter
    const priceArray = logs.map((log) => log.pricePerLiter).filter(p => p > 0);
    const averagePrice = priceArray.length > 0
      ? priceArray.reduce((a, b) => a + b, 0) / priceArray.length
      : 0;

    // Calculate total distance from trips
    const totalDistance = trips.reduce((sum, trip) => {
      return sum + (trip.actualDistance || trip.distance || 0);
    }, 0) || motorAnalytics.totalDistance || 0;

    // Calculate average efficiency (km/L)
    // Use motor analytics if available, otherwise calculate from trips
    let averageEfficiency = 0;
    if (motorAnalytics.totalDistance > 0 && motorAnalytics.totalFuelUsed > 0) {
      averageEfficiency = parseFloat((motorAnalytics.totalDistance / motorAnalytics.totalFuelUsed).toFixed(2));
    } else if (totalDistance > 0 && totalLiters > 0) {
      averageEfficiency = parseFloat((totalDistance / totalLiters).toFixed(2));
    }

    res.status(200).json({
      motorId,
      totalLiters: parseFloat(totalLiters.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      averagePrice: parseFloat(averagePrice.toFixed(2)),
      averageEfficiency,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      totalLogs: logs.length,
      fuelStats: {
        average: parseFloat(average.toFixed(2)),
        min: parseFloat(min.toFixed(2)),
        max: parseFloat(max.toFixed(2))
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch fuel stats", error: err.message });
  }
};
