const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['refuel', 'oil_change', 'tune_up', 'repair', 'inspection', 'other']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && 
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    },
    address: {
      type: String,
      trim: true
    }
  },
  details: {
    cost: {
      type: Number,
      min: 0,
      default: 0
    },
    quantity: {
      type: Number,
      min: 0
    },
    costPerLiter: {
      type: Number,
      min: 0
    },
    serviceProvider: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    odometerReading: {
      type: Number,
      min: 0
    },
    nextServiceDue: {
      type: Date
    },
    parts: [{
      name: String,
      partNumber: String,
      cost: Number,
      quantity: Number
    }],
    labor: {
      hours: Number,
      rate: Number,
      total: Number
    }
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'document', 'receipt']
    },
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringInterval: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'mileage']
  },
  recurringValue: {
    type: Number,
    min: 0
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
maintenanceRecordSchema.index({ userId: 1 });
maintenanceRecordSchema.index({ motorId: 1 });
maintenanceRecordSchema.index({ type: 1 });
maintenanceRecordSchema.index({ timestamp: -1 });
maintenanceRecordSchema.index({ userId: 1, motorId: 1 });
maintenanceRecordSchema.index({ userId: 1, type: 1 });
maintenanceRecordSchema.index({ location: '2dsphere' });

// Virtual for total cost
maintenanceRecordSchema.virtual('totalCost').get(function() {
  let total = this.details.cost || 0;
  
  // Add parts cost
  if (this.details.parts) {
    total += this.details.parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0);
  }
  
  // Add labor cost
  if (this.details.labor && this.details.labor.total) {
    total += this.details.labor.total;
  }
  
  return total;
});

// Virtual for fuel efficiency calculation
maintenanceRecordSchema.virtual('fuelEfficiency').get(function() {
  if (this.type === 'refuel' && this.details.quantity && this.details.costPerLiter) {
    return this.details.quantity / this.details.costPerLiter;
  }
  return null;
});

// Method to calculate next service due
maintenanceRecordSchema.methods.calculateNextService = function() {
  if (!this.isRecurring || !this.recurringInterval) return null;
  
  const now = new Date();
  let nextDue;
  
  switch (this.recurringInterval) {
    case 'weekly':
      nextDue = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
      break;
    case 'monthly':
      nextDue = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
      break;
    case 'quarterly':
      nextDue = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
      break;
    case 'yearly':
      nextDue = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000));
      break;
    case 'mileage':
      // This would need current odometer reading
      nextDue = null;
      break;
    default:
      nextDue = null;
  }
  
  return nextDue;
};

// Method to mark as completed
maintenanceRecordSchema.methods.complete = function() {
  this.isCompleted = true;
  this.completedAt = new Date();
  return this.save();
};

// Method to verify record
maintenanceRecordSchema.methods.verify = function(verifiedBy) {
  this.isVerified = true;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

// Static method to get maintenance history
maintenanceRecordSchema.statics.getMaintenanceHistory = function(userId, motorId, options = {}) {
  const {
    type,
    startDate,
    endDate,
    limit = 10,
    page = 1,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options;

  const filter = { userId };
  if (motorId) filter.motorId = motorId;
  if (type) filter.type = type;
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = new Date(startDate);
    if (endDate) filter.timestamp.$lte = new Date(endDate);
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  return this.find(filter)
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('motorId', 'nickname brand model');
};

// Static method to get maintenance statistics
maintenanceRecordSchema.statics.getMaintenanceStats = function(userId, period = '30d') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRecords: { $sum: 1 },
        totalCost: { $sum: '$details.cost' },
        refuelCount: {
          $sum: { $cond: [{ $eq: ['$type', 'refuel'] }, 1, 0] }
        },
        oilChangeCount: {
          $sum: { $cond: [{ $eq: ['$type', 'oil_change'] }, 1, 0] }
        },
        tuneUpCount: {
          $sum: { $cond: [{ $eq: ['$type', 'tune_up'] }, 1, 0] }
        },
        avgCostPerRecord: { $avg: '$details.cost' }
      }
    }
  ]);
};

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);
