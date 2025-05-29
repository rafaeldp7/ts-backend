const mongoose = require("mongoose");

const GeneralAnalyticsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // example: "trafficTrends", "topReports", "avgFuelPrice"
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true, // can store arrays, objects, numbers, etc.
  },
  description: {
    type: String, // optional explanation for admins
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // usually an admin
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("GeneralAnalytics", GeneralAnalyticsSchema);
