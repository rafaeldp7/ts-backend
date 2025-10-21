// Export all models for easy importing
const User = require('./User');
const Motor = require('./Motor');
const Report = require('./Report');
const GasStation = require('./GasStation');
const Trip = require('./Trip');
const MaintenanceRecord = require('./MaintenanceRecord');
const Notification = require('./Notification');
const Settings = require('./Settings');
const Analytics = require('./Analytics');
const Weather = require('./Weather');
const Route = require('./Route');
const Feedback = require('./Feedback');
const Achievement = require('./Achievement');
const UserAchievement = require('./UserAchievement');
const Log = require('./Log');

// Export new models from root level
const FuelLog = require('./FuelLogModel');
const DailyAnalytics = require('./DailyAnalytics');
const GeneralAnalytics = require('./GeneralAnalytics');
const SavedDestination = require('./SavedDestinationModel');

module.exports = {
  User,
  Motor,
  Report,
  GasStation,
  Trip,
  MaintenanceRecord,
  Notification,
  Settings,
  Analytics,
  Weather,
  Route,
  Feedback,
  Achievement,
  UserAchievement,
  Log,
  // New models
  FuelLog,
  DailyAnalytics,
  GeneralAnalytics,
  SavedDestination
};