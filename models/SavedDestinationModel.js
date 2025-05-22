const mongoose = require("mongoose");

const SavedDestinationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  label: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("SavedDestination", SavedDestinationSchema);
