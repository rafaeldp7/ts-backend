  const express = require("express");
  const bcrypt = require("bcryptjs");
  const jwt = require("jsonwebtoken");
  const User = require("../models/User");
  const authMiddleware = require("../middlewares/authMiddleware"); // Import middleware
  
  
  const router = express.Router();

// Trip Creation Route
app.post("/api/trip/create", async (req, res) => {
  try {
    const { user_id, start_location, destination, motor_id } = req.body;
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    // Fetch directions from Google Maps API
    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${start_location}&destination=${destination}&key=${googleMapsApiKey}`;
    const response = await axios.get(directionsUrl);
    
    if (response.data.status !== "OK") {
      return res.status(400).json({ error: "Failed to fetch route" });
    }

    const route = response.data.routes[0];
    const distance = route.legs[0].distance.text;
    const time_estimated_of_arrival = route.legs[0].duration.text;
    const routes = route.overview_polyline.points;

    // Create a new gas session
    const gasSession = new GasSession({
      user_id,
      motor_id,
      distance,
      traffic_rate: "N/A",
      routes,
      time_estimated_of_arrival,
      time_estimated_minutes: route.legs[0].duration.value / 60,
      fuel_consumed_estimate: "0", // Will be updated during the trip
      fuel_consumed_peak_speed: "0",
      fuel_consumed_average_speed: "0",
      speed_peak: "0",
      speed_average: "0",
      time_departed: new Date().toISOString(),
      time_arrived: "",
      reroute: "No",
      reroute_distance: "0",
    });
    await gasSession.save();

    res.status(201).json({ message: "Trip created successfully", trip: gasSession });
  } catch (error) {
    res.status(500).json({ error: "Error creating trip" });
  }
});

// Gas Session Routes
app.post("/api/gas-sessions", async (req, res) => {
  try {
    const gasSession = new GasSession(req.body);
    await gasSession.save();
    res.status(201).json({ message: "Gas session logged successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving gas session" });
  }
});

module.exports = router;
