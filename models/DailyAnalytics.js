const mongoose = require('mongoose');

const DailyAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Motor',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalDistance: {
    type: Number,
    default: 0
  },
  totalFuelUsed: {
    type: Number,
    default: 0
  },
  kmphAverage: {
    type: Number,
    default: 0
  },
  trips: {
    type: Number,
    default: 0
  },
  alerts: [{
    type: String
  }]
}, { 
  timestamps: true 
});

// Indexes for better query performance
DailyAnalyticsSchema.index({ userId: 1 });
DailyAnalyticsSchema.index({ motorId: 1 });
DailyAnalyticsSchema.index({ date: -1 });
DailyAnalyticsSchema.index({ userId: 1, date: -1 });
DailyAnalyticsSchema.index({ motorId: 1, date: -1 });

module.exports = mongoose.model('DailyAnalytics', DailyAnalyticsSchema);
