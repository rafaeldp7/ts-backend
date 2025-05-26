const mongoose = require("mongoose");

const MotorcycleSchema = new mongoose.Schema(
  {
    model: { type: String, required: true, unique: true },
    engineDisplacement: { type: Number }, // optional
    power: { type: String },              // optional
    torque: { type: String },             // optional
    fuelTank: { type: Number },           // optional
    fuelConsumption: { type: Number, required: true }, // required
    isDeleted: { type: Boolean, default: false }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Motorcycle", MotorcycleSchema);
