
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("./cron");
// const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const trackingRoutes = require("./routes/trackingRoutes");
const tripRoutes = require("./routes/tripRoutes");
const motorcycleRoutes = require("./routes/motorcycleRoutes");
const userMotorRoutes = require("./routes/userMotorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const savedDestinationRoutes = require("./routes/savedDestinationRoutes");
const fuelLogRoutes = require("./routes/fuelLogRoutes");
const gasStationRoutes = require("./routes/gasStationsRoutes");
const leaderboardAnalyticsRoutes = require("./routes/leaderboardsAnalyticsRoutes");
const fuelStatsRoutes = require("./routes/fuelStatsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");

// Admin routes
const adminAuthRoutes = require("./admin-backend/backend/routes/adminAuth");
const adminManagementRoutes = require("./admin-backend/backend/routes/adminManagement");
const adminSettingsRoutes = require("./admin-backend/backend/routes/adminSettings");
const adminRoutes = require("./admin-backend/backend/routes/admin");
const adminDashboardRoutes = require("./admin-backend/backend/routes/dashboard");
const adminGasStationRoutes = require("./admin-backend/backend/routes/gasStations");
const adminReportRoutes = require("./admin-backend/backend/routes/reports");
const adminTripRoutes = require("./admin-backend/backend/routes/trips");
const adminUserRoutes = require("./admin-backend/backend/routes/users");
const setupRoutes = require("./admin-backend/backend/routes/setup");

// New optimization routes
const calculationsRoutes = require("./routes/calculations");
const dataRoutes = require("./routes/data");
const mapRoutes = require("./routes/map");
const tripOptimizationRoutes = require("./routes/trip");
const fuelRoutes = require("./routes/fuel");
const routeRoutes = require("./routes/route");
const locationRoutes = require("./routes/location");
const cacheRoutes = require("./routes/cache");
const performanceRoutes = require("./routes/performance");
const motorRoutes = require("./routes/motor");
const trackingOptimizationRoutes = require("./routes/tracking");
const permissionsRoutes = require("./routes/permissions");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS
// app.use(morgan("dev")); // Log HTTP requests

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/trafficslight';

console.log('🔍 Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('Using MONGO_URI:', MONGO_URI);
console.log('✅ All route variables properly declared');

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.log("⚠️ Server will continue without database connection");
    // Don't exit - let server run without database for testing
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/motorcycles", motorcycleRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/user-motors", userMotorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fuel-logs", fuelLogRoutes);
app.use("/api/saved-destinations", savedDestinationRoutes);
app.use("/api/gas-stations", gasStationRoutes);
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/general-analytics", require("./routes/generalAnalyticsRoutes"));
app.use("/api/leaderboard-analytics", leaderboardAnalyticsRoutes);
app.use("/api/fuel-stats", fuelStatsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", require("./routes/dashboard"));

app.use("/api/maintenance-records", maintenanceRoutes);

// Admin routes
app.use("/api/admin-auth", adminAuthRoutes);
app.use("/api/admin-management", adminManagementRoutes);
app.use("/api/admin-settings", adminSettingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin-dashboard", adminDashboardRoutes);
app.use("/api/admin-gas-stations", adminGasStationRoutes);
app.use("/api/admin-reports", adminReportRoutes);
app.use("/api/admin-trips", adminTripRoutes);
app.use("/api/admin-users", adminUserRoutes);
app.use("/api/setup", setupRoutes);

// New optimization routes
app.use("/api/calculations", calculationsRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/trip", tripOptimizationRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/cache", cacheRoutes);
app.use("/api/performance", performanceRoutes);
app.use("/api/motor", motorRoutes);
app.use("/api/tracking", trackingOptimizationRoutes);
app.use("/api/permissions", permissionsRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// Removed duplicate express.json() - already defined above


// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ msg: "Internal Server Error", error: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Running in ${process.env.NODE_ENV || "development"} mode`);
});
