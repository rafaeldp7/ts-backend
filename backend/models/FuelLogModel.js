const mongoose = require('mongoose');

const FuelLogSchema = new mongoose.Schema({
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
  liters: { 
    type: Number, 
    required: true 
  },
  pricePerLiter: { 
    type: Number, 
    required: true 
  },
  totalCost: { 
    type: Number, 
    required: true 
  },
  odometer: { 
    type: Number 
  }, // optional
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'premium', 'unleaded'],
    default: 'gasoline'
  },
  location: {
    lat: Number,
    lng: Number
  },
  notes: { 
    type: String 
  },
  date: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
FuelLogSchema.index({ userId: 1 });
FuelLogSchema.index({ motorId: 1 });
FuelLogSchema.index({ date: -1 });
FuelLogSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('FuelLog', FuelLogSchema);
