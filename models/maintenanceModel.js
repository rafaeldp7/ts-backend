const mongoose = require("mongoose");

const MaintenanceRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMotor", required: true },
    type: {
      type: String,
      enum: ["change_oil", "tune_up", "repair", "other"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    details: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRecord", MaintenanceRecordSchema);
