// models/FuelLog.js
const mongoose = require("mongoose");

const FuelLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  motorId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMotor", required: true },
  liters: { type: Number, required: true },
  pricePerLiter: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("FuelLog", FuelLogSchema);
