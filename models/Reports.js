const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  reportType: {
    type: String,
    enum: ["Accident", "Traffic Jam", "Road Closure", "Hazard"],
    required: true
  },
  description: {
    type: String,
    maxlength: 20,
    required: true
  },
  address:{
    type: String,
    required: true
  }
  verified: {
    verifiedByAdmin: {type: Number, required: true},
    verifiedByUser:{type: Number, required: true}
  }
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model("Report", reportSchema);
