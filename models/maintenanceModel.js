const mongoose = require("mongoose");

const MaintenanceRecordSchema = new mongoose.Schema(
  {
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
    type: {
      type: String,
      enum: ["refuel", "oil_change", "tune_up", "repair", "other"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    details: {
      cost: { type: Number },
      quantity: { type: Number },
      notes: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRecord", MaintenanceRecordSchema);
