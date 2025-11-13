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
    odometer: { type: Number }, // Odometer reading at time of maintenance
    location: {
      lat: { type: Number },
      lng: { type: Number },
      latitude: { type: Number }, // Support both formats
      longitude: { type: Number }, // Support both formats
      address: { type: String } // Address where maintenance was performed
    },
    details: {
      cost: { type: Number },
      quantity: { type: Number },
      costPerLiter: { type: Number }, // Store cost per liter for refuel type
      notes: { type: String },
      // Refuel-specific fields
      fuelTank: { type: Number }, // Fuel tank capacity in liters
      refueledPercent: { type: Number }, // Percentage of tank refueled
      fuelLevelBefore: { type: Number }, // Fuel level before refuel (percentage)
      fuelLevelAfter: { type: Number }, // Fuel level after refuel (percentage)
      // Oil change specific fields
      oilType: { type: String }, // Type of oil used
      oilViscosity: { type: String }, // Oil viscosity (e.g., "10W-40")
      // General maintenance fields
      serviceProvider: { type: String }, // Name of service provider/mechanic
      warranty: { type: Boolean, default: false }, // Whether service is under warranty
      nextServiceDate: { type: Date }, // Recommended next service date
      nextServiceOdometer: { type: Number } // Recommended next service odometer reading
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MaintenanceRecord", MaintenanceRecordSchema);
