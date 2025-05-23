const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserMotor",
    required: true,
  },
  distance: { type: Number, required: true },     // in kilometers
  fuelUsed: { type: Number, required: true },     // in liters
  timeArrived: { type: Number, required: true },  // in minutes
  eta: { type: Number, required: true },          // in minutes
  destination: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Trip", TripSchema);
