const mongoose = require("mongoose");

const MotorcycleSchema = new mongoose.Schema(
  {
    model: { type: String, required: true, unique: true },
    engineDisplacement: { type: Number, required: true }, // in cc
    power: { type: String, required: true }, // e.g. '9.12hp @ 7,500rpm'
    torque: { type: String, required: true }, // e.g. '9Nm @ 6,500rpm'
    fuelTank: { type: Number, required: true }, // in Liters
    fuelConsumption: { type: Number, required: true }, // in km/L
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Motorcycle", MotorcycleSchema);
