const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  reportType: {
    type: String,
    enum: ["Accident", "Traffic Jam", "Road Closure", "Hazard", "Police"],
    required: true
  },
  description: {
    type: String,
    maxlength: 20,
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});
