const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  reportType: {
    type: String,
    enum: ["Accident", "Traffic Jam", "Road Closure", "Hazard"],
    required: true,
  },
  description: {
    type: String,
    maxlength: 100, 
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  verified: {
    verifiedByAdmin: { type: Number, required: true },
    verifiedByUser: { type: Number, required: true },
  },
  votes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      vote: { type: Number, enum: [1, -1], required: true },
    },
  ],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Optional: Virtual for total votes
reportSchema.virtual("totalVotes").get(function () {
  return this.votes.reduce((sum, v) => sum + v.vote, 0);
});

module.exports = mongoose.model("Report", reportSchema);
