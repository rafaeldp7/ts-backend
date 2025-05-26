const mongoose = require("mongoose");

const GasStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: {
      type: String,
      enum: ["Petron", "Shell", "Caltex", "Unioil", "Phoenix", "Other"],
      default: "Other",
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: {
      street: String,
      barangay: String,
      city: String,
      province: String,
    },
    fuelPrices: {
      gasoline: Number,
      diesel: Number,
      premium: Number,
    },
    priceSource: {
      type: String,
      enum: ["admin", "user", "scraped", "unknown"],
      default: "unknown",
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    servicesOffered: { type: [String], default: [] },
    openHours: String,
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GasStationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("GasStation", GasStationSchema);
