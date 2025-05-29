const mongoose = require("mongoose");

const FuelLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorId: { type: mongoose.Schema.Types.ObjectId, ref: "UserMotor", required: true },
    liters: { type: Number, required: true },
    pricePerLiter: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    odometer: { type: Number }, // optional
    fuelType: {
      type: String,
      enum: ["gasoline", "diesel", "premium", "unleaded"],
      default: "gasoline",
    },
    location: {
      lat: Number,
      lng: Number,
    },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FuelLog", FuelLogSchema);
