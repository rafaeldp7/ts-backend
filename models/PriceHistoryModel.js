const mongoose = require("mongoose");

const PriceHistorySchema = new mongoose.Schema(
  {
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: "GasStation", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    prices: {
      gasoline: Number,
      diesel: Number,
      premium: Number,
    },
    source: {
      type: String,
      enum: ["admin", "user", "scraped"],
      required: true,
    },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceHistory", PriceHistorySchema);
