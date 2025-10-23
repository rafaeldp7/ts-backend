const mongoose = require('mongoose');

const SavedDestinationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    required: true
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  category: {
    type: String,
    enum: ['Home', 'Work', 'School', 'Other'],
    default: 'Other'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SavedDestinationSchema.index({ userId: 1 });
SavedDestinationSchema.index({ category: 1 });
SavedDestinationSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('SavedDestination', SavedDestinationSchema);
