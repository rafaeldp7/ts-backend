const mongoose = require("mongoose");

const UserMotorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorcycleId: { type: mongoose.Schema.Types.ObjectId, ref: "Motorcycle", required: true },
    
    nickname: { type: String },
    plateNumber: { type: String },

    registrationDate: { type: Date },
    age: { type: Number },

    kmphRecords: [
      {
        date: { type: Date },
        speed: { type: Number },
      },
    ],

    changeOilHistory: [
      {
        date: { type: Date },
      },
    ],

    tuneUpHistory: [
      {
        date: { type: Date },
      },
    ],

    fuelConsumptionStats: {
      average: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      min: { type: Number, default: 0 },
    },

    analytics: {
      tripsCompleted: { type: Number, default: 0 },
      totalDistance: { type: Number, default: 0 },
      totalFuelUsed: { type: Number, default: 0 },
      maintenanceAlerts: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserMotor", UserMotorSchema);
