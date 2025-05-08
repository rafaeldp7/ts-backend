const express = require("express");
const router = express.Router();
const axios = require("axios");
const GasSession = require("../models/GasSession");

// Load environment variables
require("dotenv").config();

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get the best route for a trip
 */
router.post("/start-trip", async (req, res) => {
  try {
    const { user_id, motor_id, origin, destination } = req.body;

    // Get route from Google Maps Directions API
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== "OK") {
      return res.status(400).json({ error: "Failed to get route" });
    }

    const route = response.data.routes[0];
    const estimatedTime = route.legs[0].duration.text;
    const estimatedDistance = route.legs[0].distance.text;

    // Create a new gas session (trip record)
    const newGasSession = new GasSession({
      user_id,
      motor_id,
      distance: estimatedDistance,
      traffic_rate: "Moderate", // Placeholder, we will update this
      routes: JSON.stringify(route.legs[0].steps),
      time_estimated_of_arrival: estimatedTime,
      time_estimated_minutes: route.legs[0].duration.value / 60, // Convert seconds to minutes
      fuel_consumed_estimate: "0", // Placeholder, will be updated later
      reroute: "No", // Initial state
      reroute_distance: "0", // Initial state
    });

    await newGasSession.save();

    res.status(201).json({
      message: "Trip started successfully",
      route: route.legs[0].steps,
      estimatedTime,
      estimatedDistance,
    });
  } catch (error) {
    console.error("Error starting trip:", error);
    res.status(500).json({ error: "Error starting trip" });
  }
});

/**
 * Update trip location & detect rerouting
 */
router.post("/update-location", async (req, res) => {
  try {
    const { session_id, current_location } = req.body;

    const session = await GasSession.findById(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if user deviated from the planned route
    const plannedRoute = JSON.parse(session.routes);
    const lastPoint = plannedRoute[plannedRoute.length - 1].end_location;

    // Calculate distance from last planned point
    const distanceResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        current_location
      )}&destinations=${lastPoint.lat},${lastPoint.lng}&key=${GOOGLE_MAPS_API_KEY}`
    );

    const distance = distanceResponse.data.rows[0].elements[0].distance.value;

    if (distance > 500) {
      // If user deviated more than 500m, consider it a reroute
      session.reroute = "Yes";
      session.reroute_distance = `${distance} meters`;
    }

    await session.save();

    res.json({ message: "Location updated", reroute: session.reroute, reroute_distance: session.reroute_distance });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ error: "Error updating location" });
  }
});

/**
 * Get nearby gas stations
 */
router.get("/nearby-gas", async (req, res) => {
  try {
    const { location } = req.query;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${encodeURIComponent(
        location
      )}&radius=5000&type=gas_station&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (response.data.status !== "OK") {
      return res.status(400).json({ error: "Failed to fetch gas stations" });
    }

    const gasStations = response.data.results.map((place) => ({
      name: place.name,
      address: place.vicinity,
      location: place.geometry.location,
    }));

    res.json(gasStations);
  } catch (error) {
    console.error("Error fetching gas stations:", error);
    res.status(500).json({ error: "Error fetching gas stations" });
  }
});

module.exports = router;
