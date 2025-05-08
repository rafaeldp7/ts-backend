const mongoose = require("mongoose");

const MotorSchema = new mongoose.Schema({
  motorId: { type: String, unique: true }, // Auto-generated ID
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Owner ID
  motor_name: { type: String, required: true },
  motor_type: { type: String, required: true },
  cc: { type: String, required: true }, // Engine displacement
  fuelEfficiency: { type: Number, default: null }, // Fuel efficiency in km/L
  fuelEfficiencyHistory: [{ distance: Number, fuelUsed: Number, efficiency: Number }], // History of fuel efficiency calculations
  motor_image: { type: String }, // URL or path to motor image (optional)
});

// Middleware to auto-generate `motorId` before saving
MotorSchema.pre("save", async function (next) {
  if (!this.motorId) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 01-12
    const day = String(now.getDate()).padStart(2, "0"); // 01-31

    // Count existing motors for today
    const count = await this.constructor.countDocuments({
      motorId: new RegExp(`^${year}${month}${day}`),
    });

    // Generate ID: YYMMDD0001, YYMMDD0002, etc.
    this.motorId = `${year}${month}${day}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// Virtual field for calculating the latest fuel efficiency (from the latest entry in fuelEfficiencyHistory)
MotorSchema.virtual("latestFuelEfficiency").get(function () {
  const latest = this.fuelEfficiencyHistory[this.fuelEfficiencyHistory.length - 1];
  return latest ? latest.efficiency : this.fuelEfficiency;
});

module.exports = mongoose.model("Motor", MotorSchema);
