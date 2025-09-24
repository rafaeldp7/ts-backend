const mongoose = require("mongoose");

const UserMotorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorcycleId: { type: mongoose.Schema.Types.ObjectId, ref: "Motorcycle", required: true },
    
    // 🔖 Basic Info
    nickname: { type: String },
    plateNumber: { type: String },
    registrationDate: { type: Date },
    dateAcquired: { type: Date },
    odometerAtAcquisition: { type: Number }, // in kilometers
    currentOdometer: { type: Number, default: 0 }, // in kilometers
    age: { type: Number },


    // 📊 Speed Records
    kmphRecords: [
      {
        date: { type: Date },
        speed: { type: Number },
      },
    ],

    // 🛠 Maintenance Logs
    changeOilHistory: [
      { date: { type: Date } },
    ],
    tuneUpHistory: [
      { date: { type: Date } },
    ],

    // ⛽ Fuel Tracking
    currentFuelLevel: { type: Number, default: 0 }, // liters currently in the tank

    // 📈 Fuel Consumption Analytics km/L
    fuelConsumptionStats: {
      average: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      min: { type: Number, default: 0 },
    },

    // 📊 General Analytics
    analytics: {
      tripsCompleted: { type: Number, default: 0 },
      totalDistance: { type: Number, default: 0 },
      totalFuelUsed: { type: Number, default: 0 },
      maintenanceAlerts: [{ type: String }],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//
// 🔮 Virtuals
//

// Total drivable distance with full tank
UserMotorSchema.virtual("totalDrivableDistance").get(function () {
  if (!this.motorcycleId || !this.populated("motorcycleId")) return null;
  return this.motorcycleId.fuelConsumption * this.motorcycleId.fuelTank;
});

// Remaining drivable distance with currentFuelLevel
UserMotorSchema.virtual("gasLeft").get(function () {
  if (!this.motorcycleId || !this.populated("motorcycleId")) return null;
  return this.motorcycleId.fuelConsumption * this.currentFuelLevel;
});

// 🚨 Low Fuel Alert (true if remaining distance < 10% of total drivable distance)
UserMotorSchema.virtual("isLowFuel").get(function () {
  if (!this.motorcycleId || !this.populated("motorcycleId")) return null;

  const totalDrivable = this.motorcycleId.fuelConsumption * this.motorcycleId.fuelTank;
  const remaining = this.motorcycleId.fuelConsumption * this.currentFuelLevel;

  return remaining < totalDrivable * 0.1;
});

module.exports = mongoose.model("UserMotor", UserMotorSchema);
