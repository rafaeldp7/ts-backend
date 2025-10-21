const express = require('express');
const router = express.Router();
const controller = require('../controllers/fuelLogController');

/**
 * 👤 USER SIDE ROUTES
 */

// 📥 Create new fuel log
// METHOD: POST
// BODY: { userId, motorId, liters, pricePerLiter, [notes] }
// Returns: Created fuel log with computed totalCost
router.post('/', controller.createFuelLog);

// 📄 Get all fuel logs by user
// METHOD: GET
// PARAM: userId
// Returns: Array of fuel logs for the specified user with populated motor info
router.get('/:userId', controller.getFuelLogsByUser);

// 📈 Count total fuel logs (admin or dashboard purpose)
// METHOD: GET
// Returns: { totalFuelLogs: number }
router.get('/count', controller.getFuelLogCount);

// ✏️ Update specific fuel log
// METHOD: PUT
// PARAM: fuelLogId
// BODY: { liters, pricePerLiter, notes }
// Returns: Updated fuel log with new totalCost
router.put('/:id', controller.updateFuelLog);

// ❌ Delete a fuel log
// METHOD: DELETE
// PARAM: fuelLogId
// Returns: Deleted confirmation
router.delete('/:id', controller.deleteFuelLog);

/**
 * 🛠️ ADMIN ANALYTICS ROUTES
 */

// 📊 Basic overview (total logs, liters, cost)
// METHOD: GET
// Returns: { totalLogs, totalLiters, totalSpent }
router.get('/admin/overview', controller.getFuelLogOverview);

// 📊 Average fuel used per motor
// METHOD: GET
// Returns: Array of { motorId, averageLiters }
router.get('/admin/avg-per-motor', controller.getAvgFuelByMotor);

// 🏆 Top 5 users by total fuel spending
// METHOD: GET
// Returns: Array of top spenders with user info and totalSpent
router.get('/admin/top-spenders', controller.getTopFuelSpenders);

// 📆 Monthly fuel usage trend
// METHOD: GET
// Returns: Array of { month, totalLiters, totalCost }
router.get('/admin/monthly-usage', controller.getMonthlyFuelUsage);

module.exports = router;
