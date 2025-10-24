const mongoose = require('mongoose');

const motorcycleSchema = new mongoose.Schema({
  // Basic Information
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  make: {
    type: String,
    required: [true, 'Make is required'],
    trim: true,
    maxlength: [50, 'Make cannot exceed 50 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
    maxlength: [50, 'Model cannot exceed 50 characters']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1900, 'Invalid year'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  
  // Vehicle Information
  plateNumber: {
    type: String,
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9\-\s]+$/, 'Invalid plate number format']
  },
  engineNumber: {
    type: String,
    required: [true, 'Engine number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  chassisNumber: {
    type: String,
    required: [true, 'Chassis number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  
  // Technical Specifications
  engine: {
    displacement: {
      type: Number,
      required: [true, 'Engine displacement is required'],
      min: [0, 'Displacement cannot be negative']
    },
    type: {
      type: String,
      enum: ['2-stroke', '4-stroke'],
      required: [true, 'Engine type is required']
    },
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
      default: 'gasoline'
    },
    power: Number, // in HP
    torque: Number // in Nm
  },
  
  // Dimensions and Weight
  dimensions: {
    length: Number, // in cm
    width: Number, // in cm
    height: Number, // in cm
    wheelbase: Number, // in cm
    groundClearance: Number, // in cm
    weight: {
      type: Number,
      required: [true, 'Weight is required'],
      min: [0, 'Weight cannot be negative']
    }
  },
  
  // Performance Specifications
  performance: {
    topSpeed: Number, // in km/h
    acceleration: {
      zeroToSixty: Number, // in seconds
      zeroToHundred: Number // in seconds
    },
    fuelCapacity: {
      type: Number,
      required: [true, 'Fuel capacity is required'],
      min: [0, 'Fuel capacity cannot be negative']
    },
    fuelEfficiency: {
      city: Number, // km/L
      highway: Number, // km/L
      combined: Number // km/L
    }
  },
  
  // Color and Appearance
  color: {
    primary: {
      type: String,
      required: [true, 'Primary color is required'],
      trim: true
    },
    secondary: String,
    trim: String
  },
  photos: [{
    filename: String,
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Registration Information
  registration: {
    number: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    issueDate: {
      type: Date,
      required: [true, 'Registration issue date is required']
    },
    expiryDate: {
      type: Date,
      required: [true, 'Registration expiry date is required']
    },
    issuingAuthority: {
      type: String,
      required: [true, 'Issuing authority is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'suspended', 'cancelled'],
      default: 'active'
    }
  },
  
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    startDate: Date,
    endDate: Date,
    coverage: {
      type: String,
      enum: ['comprehensive', 'third-party', 'none'],
      default: 'none'
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'none'
    }
  },
  
  // Maintenance Information
  maintenance: {
    lastServiceDate: Date,
    nextServiceDate: Date,
    serviceInterval: {
      type: Number,
      default: 5000 // in km
    },
    totalMileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative']
    },
    serviceHistory: [{
      date: Date,
      mileage: Number,
      type: {
        type: String,
        enum: ['routine', 'repair', 'inspection', 'other']
      },
      description: String,
      cost: Number,
      serviceProvider: String
    }]
  },
  
  // Status and Settings
  status: {
    type: String,
    enum: ['active', 'inactive', 'sold', 'stolen', 'damaged'],
    default: 'active'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isShared: {
    type: Boolean,
    default: false
  },
  
  // Statistics
  stats: {
    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    totalFuelConsumed: { type: Number, default: 0 },
    averageFuelEfficiency: { type: Number, default: 0 },
    lastTripDate: Date
  },
  
  // Notes and Tags
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
  tags: [String],
  
  // System Information
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
motorcycleSchema.index({ owner: 1 });
motorcycleSchema.index({ plateNumber: 1 });
motorcycleSchema.index({ make: 1, model: 1 });
motorcycleSchema.index({ year: 1 });
motorcycleSchema.index({ status: 1 });
motorcycleSchema.index({ 'registration.expiryDate': 1 });
motorcycleSchema.index({ 'insurance.endDate': 1 });
motorcycleSchema.index({ isArchived: 1 });

// Virtual for age
motorcycleSchema.virtual('age').get(function() {
  return new Date().getFullYear() - this.year;
});

// Virtual for registration status
motorcycleSchema.virtual('isRegistrationValid').get(function() {
  return this.registration.status === 'active' && 
         this.registration.expiryDate > new Date();
});

// Virtual for insurance status
motorcycleSchema.virtual('isInsuranceValid').get(function() {
  return this.insurance.status === 'active' && 
         this.insurance.endDate > new Date();
});

// Virtual for next service due
motorcycleSchema.virtual('isServiceDue').get(function() {
  if (!this.maintenance.nextServiceDate) return false;
  return this.maintenance.nextServiceDate <= new Date();
});

// Method to update mileage
motorcycleSchema.methods.updateMileage = function(newMileage) {
  if (newMileage > this.maintenance.totalMileage) {
    this.maintenance.totalMileage = newMileage;
    
    // Check if service is due
    const lastServiceMileage = this.maintenance.serviceHistory.length > 0 
      ? this.maintenance.serviceHistory[this.maintenance.serviceHistory.length - 1].mileage 
      : 0;
    
    if (newMileage - lastServiceMileage >= this.maintenance.serviceInterval) {
      this.maintenance.nextServiceDate = new Date();
    }
    
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to add service record
motorcycleSchema.methods.addServiceRecord = function(serviceData) {
  this.maintenance.serviceHistory.push({
    date: new Date(),
    mileage: this.maintenance.totalMileage,
    ...serviceData
  });
  
  // Update next service date
  this.maintenance.nextServiceDate = new Date(
    Date.now() + (this.maintenance.serviceInterval * 24 * 60 * 60 * 1000)
  );
  
  return this.save();
};

// Method to calculate fuel efficiency
motorcycleSchema.methods.calculateFuelEfficiency = function() {
  if (this.stats.totalDistance > 0 && this.stats.totalFuelConsumed > 0) {
    this.stats.averageFuelEfficiency = this.stats.totalDistance / this.stats.totalFuelConsumed;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to find motorcycles by owner
motorcycleSchema.statics.findByOwner = function(ownerId) {
  return this.find({ owner: ownerId, isArchived: false });
};

// Static method to find motorcycles by make and model
motorcycleSchema.statics.findByMakeModel = function(make, model) {
  return this.find({ 
    make: new RegExp(make, 'i'), 
    model: new RegExp(model, 'i'),
    isArchived: false 
  });
};

// Static method to get motorcycle statistics
motorcycleSchema.statics.getMotorcycleStats = function() {
  return this.aggregate([
    { $match: { isArchived: false } },
    {
      $group: {
        _id: null,
        totalMotorcycles: { $sum: 1 },
        activeMotorcycles: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        avgMileage: { $avg: '$maintenance.totalMileage' },
        avgAge: { $avg: { $subtract: [new Date().getFullYear(), '$year'] } }
      }
    }
  ]);
};

// Static method to find motorcycles due for service
motorcycleSchema.statics.findDueForService = function() {
  return this.find({
    'maintenance.nextServiceDate': { $lte: new Date() },
    status: 'active',
    isArchived: false
  });
};

module.exports = mongoose.model('Motorcycle', motorcycleSchema);
