const mongoose = require("mongoose");
const moment = require("moment");

const TripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserMotor",
    required: true,
  },

  // 🟡 Estimated (Planned)
  distance: { type: Number, required: true },
  fuelUsedMin: { type: Number, required: true },
  fuelUsedMax: { type: Number, required: true },
  eta: { type: String, required: false },
  timeArrived: { type: String, required: false },

  // 🟢 Actual (Tracked)
  tripStartTime: { type: Date, default: Date.now },
  tripEndTime: { type: Date },
  actualDistance: { type: Number, default: null },
  actualFuelUsedMin: { type: Number, default: null },
  actualFuelUsedMax: { type: Number, default: null },
  duration: { type: Number }, // in minutes
  kmph: { type: Number, default: 0 },

  // 📍 Location
  startLocation: {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  endLocation: {
    address: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  
  // 🛣 Routing
  plannedPolyline: { type: String },
  actualPolyline: { type: String },
  wasRerouted: { type: Boolean, default: false },
  rerouteCount: { type: Number, default: 0 },

  // 🔁 Background & Analytics
  wasInBackground: { type: Boolean, default: false },
  showAnalyticsModal: { type: Boolean, default: false },
  analyticsNotes: { type: String },
  trafficCondition: {
    type: String,
    enum: ["light", "moderate", "heavy"],
    default: "moderate",
  },

  // 🧭 Trip Summary
  destination: { type: String, required: true },
  isSuccessful: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ["planned", "in-progress", "completed", "cancelled"],
    default: "completed",
  },
}, {
  timestamps: true,
});

// // 🕒 Auto-calculate duration
// TripSchema.pre("save", function (next) {
//   if (this.timeArrived && this.eta) {
//     const arrival = moment(this.timeArrived, "HH:mm");
//     const etaTime = moment(this.eta, "HH:mm");
//     const duration = arrival.diff(start, "minutes");
//     this.duration = Math.abs(duration);
//   }
//   next();
// });

module.exports = mongoose.model("Trip", TripSchema);
