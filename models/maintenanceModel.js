const mongoose = require("mongoose");

const MaintenanceRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMotor", required: true },
    type: {
      type: String,
      enum: ["oil_change", "tune_up", "refuel", "repair", "other"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    location: {
      lat: { type: Number },
      lng: { type: Number },
    },
    details: {
      cost: { type: Number },
      quantity: { type: Number },
      notes: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRecord", MaintenanceRecordSchema);
