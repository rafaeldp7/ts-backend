require("dotenv").config(); // Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const trackingRoutes = require("./routes/trackingRoutes");
const tripRoutes = require("./routes/tripRoutes");
const motorcycleRoutes = require("./routes/motorcycleRoutes");
const userMotorRoutes = require("./routes/userMotorRoutes");
const reportRoutes = require("./routes/reportRoutes");
const savedDestinationRoutes = require("./routes/savedDestinationRoutes");
const fuelLogRoutes = require("./routes/fuelLogRoutes");

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS
// app.use(morgan("dev")); // Log HTTP requests

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/motorcycles", motorcycleRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/user-motors", userMotorRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fuel-logs", fuelLogRoutes);
app.use("/api/saved-destinations", savedDestinationRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// index.js or app.js
app.use(express.json());


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
