// models/trip.js
const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  distance: { type: String, required: true },
  fuelUsed: { type: String, required: true },
  timeArrived: { type: String, required: true },
  eta: { type: String, required: true },
  destination: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("Trip", TripSchema);
