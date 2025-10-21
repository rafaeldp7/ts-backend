const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nickname: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  color: {
    type: String,
    trim: true
  },
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true
  },
  fuelTank: {
    type: Number,
    min: 0,
    max: 100,
    default: 15 // Default 15L tank
  },
  fuelConsumption: {
    type: Number,
    min: 0,
    max: 50,
    default: 0 // km/L
  },
  fuelEfficiency: {
    type: Number,
    min: 0,
    max: 50,
    default: 0 // km/L - alternative field
  },
  currentFuelLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100 // Percentage
  },
  odometer: {
    type: Number,
    min: 0,
    default: 0
  },
  analytics: {
    totalDistance: {
      type: Number,
      default: 0
    },
    totalTrips: {
      type: Number,
      default: 0
    },
    tripsCompleted: {
      type: Number,
      default: 0
    },
    totalFuelUsed: {
      type: Number,
      default: 0
    },
    avgFuelEfficiency: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
motorSchema.index({ userId: 1 });
motorSchema.index({ userId: 1, isActive: 1 });
motorSchema.index({ nickname: 1 });

// Virtual for full name
motorSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model}`;
});

// Method to update fuel level
motorSchema.methods.updateFuelLevel = function(newLevel, distanceTraveled = 0) {
  if (distanceTraveled > 0 && this.fuelConsumption > 0) {
    const fuelUsed = (distanceTraveled / this.fuelConsumption) * 100;
    this.currentFuelLevel = Math.max(0, this.currentFuelLevel - fuelUsed);
  } else {
    this.currentFuelLevel = Math.max(0, Math.min(100, newLevel));
  }
  
  this.analytics.lastUpdated = new Date();
  return this.save();
};

// Method to calculate fuel efficiency
motorSchema.methods.calculateFuelEfficiency = function(distance, fuelUsed) {
  if (fuelUsed > 0) {
    const efficiency = distance / fuelUsed;
    this.analytics.avgFuelEfficiency = efficiency;
    this.analytics.lastUpdated = new Date();
    return efficiency;
  }
  return 0;
};

module.exports = mongoose.model('Motor', motorSchema);
