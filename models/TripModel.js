const mongoose = require("mongoose");

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Link to actual user
    required: true,
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserMotor", // Link to the user's selected motorcycle
    required: true,
  },
  distance: { type: String, required: true },
  fuelUsed: { type: String, required: true },
  timeArrived: { type: String, required: true },
  eta: { type: String, required: true },
  destination: { type: String, required: true },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Trip", TripSchema);
