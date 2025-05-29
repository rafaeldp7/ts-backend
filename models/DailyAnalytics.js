
// models/DailyAnalytics.js
const mongoose = require("mongoose");

const DailyAnalyticsSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true,
  },
  totalDistance: {
    type: Number,
    default: 0,
  },
  totalFuelUsed: {
    type: Number,
    default: 0,
  },
  kmphAverage: {
    type: Number,
    default: 0,
  },
  trips: {
    type: Number,
    default: 0,
  },
  alerts: [
    {
      type: String,
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model("DailyAnalytics", DailyAnalyticsSchema);
