// hindi rin nagamit ito kasi masyadong complex, though maganda sya pero hindi kinayang iimplement.

const mongoose = require("mongoose");

const GasSessionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User ID
  motor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Motor", required: true }, // Motor ID
  distance: { type: Number, required: true }, // km
  traffic_rate: { type: String, required: true, enum: ["Light", "Moderate", "Heavy"] }, // Traffic rate (Light, Moderate, Heavy)
  routes: { type: String, required: true }, // Route name or polyline
  time_estimated_of_arrival: { type: Date, required: true }, // Estimated time of arrival
  time_estimated_minutes: { type: Number, required: true }, // Estimated time in minutes
  fuel_consumed_estimate: { type: Number, required: true }, // Estimated fuel consumption (L)
  fuel_consumed_peak_speed: { type: Number, required: true }, // Post-session fuel consumption at peak speed (L)
  fuel_consumed_average_speed: { type: Number, required: true }, // Post-session fuel consumption at average speed (L)
  speed_peak: { type: Number, required: true }, // Peak speed during trip (km/h)
  speed_average: { type: Number, required: true }, // Average speed during trip (km/h)
  time_departed: { type: Date, required: true }, // Time of departure
  time_arrived: { type: Date, required: true }, // Time of arrival
  reroute: { type: Boolean, required: true }, // Whether the user was rerouted
  reroute_distance: { type: Number, required: true }, // Reroute distance (km)
});

// Add index for faster queries on user_id and motor_id
GasSessionSchema.index({ user_id: 1, motor_id: 1 });

module.exports = mongoose.model("GasSession", GasSessionSchema);
