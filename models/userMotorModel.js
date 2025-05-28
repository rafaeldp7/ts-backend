const mongoose = require("mongoose");

const UserMotorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    motorcycleId: { type: mongoose.Schema.Types.ObjectId, ref: "Motorcycle", required: true },
    
    nickname: { type: String }, // Optional name like “Daily Ride”
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserMotor", UserMotorSchema);
