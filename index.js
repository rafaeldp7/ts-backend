require("dotenv").config(); // Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth"); // Import Auth Routes
const trackingRoutes = require("./routes/trackingRoutes");
const gasSessionRoutes = require("./routes/gasSessionRoutes"); // Import Gas Session Routes
const motorcycleRoutes = require("./routes/motorcycleRoutes"); // Import Motorcycle Routes


const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors()); // Enable CORS

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout if MongoDB is not available
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Exit process on database connection failure
  });

// Routes
app.use("/api/auth", authRoutes); // Authentication Routes

// Default Route
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

app.use("/api/tracking", trackingRoutes);

app.use("/api/motorcycles",  motorcycleRoutes); // Motorcycle Routes
app.use("/api/gas-sessions", gasSessionRoutes); // Gas Session Routes
// Start Server

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
