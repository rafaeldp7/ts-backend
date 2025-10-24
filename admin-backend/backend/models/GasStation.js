const mongoose = require('mongoose');

const gasStationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Station name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    maxlength: [50, 'Brand cannot exceed 50 characters']
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    barangay: {
      type: String,
      required: [true, 'Barangay is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      trim: true
    },
    zipCode: String,
    coordinates: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Invalid latitude'],
        max: [90, 'Invalid latitude']
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Invalid longitude'],
        max: [180, 'Invalid longitude']
      }
    }
  },
  
  // Contact Information
  contact: {
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    website: String
  },
  
  // Operating Hours
  operatingHours: {
    monday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    },
    tuesday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    },
    wednesday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    },
    thursday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    },
    friday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    },
    saturday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    },
    sunday: {
      open: String,
      close: String,
      is24Hours: { type: Boolean, default: false }
    }
  },
  
  // Fuel Prices
  fuelPrices: {
    gasoline: {
      regular: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      premium: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      super: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    },
    diesel: {
      regular: {
        type: Number,
        min: [0, 'Price cannot be negative']
      },
      premium: {
        type: Number,
        min: [0, 'Price cannot be negative']
      }
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Services Offered
  services: {
    fuel: {
      gasoline: { type: Boolean, default: true },
      diesel: { type: Boolean, default: true },
      lpg: { type: Boolean, default: false }
    },
    convenience: {
      store: { type: Boolean, default: false },
      atm: { type: Boolean, default: false },
      restroom: { type: Boolean, default: false },
      carWash: { type: Boolean, default: false },
      airPump: { type: Boolean, default: false }
    },
    automotive: {
      oilChange: { type: Boolean, default: false },
      tireService: { type: Boolean, default: false },
      batteryService: { type: Boolean, default: false },
      towing: { type: Boolean, default: false }
    },
    food: {
      restaurant: { type: Boolean, default: false },
      fastFood: { type: Boolean, default: false },
      coffee: { type: Boolean, default: false }
    }
  },
  
  // Amenities
  amenities: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    isAvailable: { type: Boolean, default: true }
  }],
  
  // Photos and Media
  photos: [{
    filename: String,
    url: String,
    caption: String,
    isPrimary: { type: Boolean, default: false }
  }],
  
  // Status and Verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed', 'under-maintenance', 'pending-verification'],
    default: 'pending-verification'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  
  // Statistics and Ratings
  stats: {
    totalVisits: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalFuelSold: { type: Number, default: 0 },
    lastVisit: Date
  },
  
  // Reviews and Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    categories: {
      fuelQuality: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      cleanliness: { type: Number, min: 1, max: 5 },
      price: { type: Number, min: 1, max: 5 }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isVerified: { type: Boolean, default: false }
  }],
  
  // Business Information
  business: {
    licenseNumber: String,
    businessPermit: String,
    taxId: String,
    owner: {
      name: String,
      contact: String
    }
  },
  
  // System Information
  isPublic: {
    type: Boolean,
    default: true
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
gasStationSchema.index({ name: 1 });
gasStationSchema.index({ brand: 1 });
gasStationSchema.index({ 'location.coordinates': '2dsphere' });
gasStationSchema.index({ 'location.city': 1 });
gasStationSchema.index({ 'location.barangay': 1 });
gasStationSchema.index({ status: 1 });
gasStationSchema.index({ isVerified: 1 });
gasStationSchema.index({ 'stats.averageRating': -1 });
gasStationSchema.index({ isArchived: 1 });

// Virtual for full address
gasStationSchema.virtual('fullAddress').get(function() {
  return `${this.location.address}, ${this.location.barangay}, ${this.location.city}, ${this.location.province}`;
});

// Virtual for current status
gasStationSchema.virtual('isOpen').get(function() {
  if (this.status !== 'active') return false;
  
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().substring(0, 3);
  const dayHours = this.operatingHours[dayOfWeek];
  
  if (!dayHours) return false;
  if (dayHours.is24Hours) return true;
  
  // Simple time comparison (can be enhanced)
  return true; // Simplified for now
});

// Method to update fuel prices
gasStationSchema.methods.updateFuelPrices = function(newPrices) {
  this.fuelPrices = { ...this.fuelPrices, ...newPrices };
  this.fuelPrices.lastUpdated = new Date();
  return this.save();
};

// Method to add review
gasStationSchema.methods.addReview = function(userId, rating, comment = '', categories = {}) {
  this.reviews.push({
    user: userId,
    rating,
    comment,
    categories,
    timestamp: new Date()
  });
  
  // Update statistics
  this.stats.totalReviews += 1;
  this.stats.averageRating = this.calculateAverageRating();
  
  return this.save();
};

// Method to calculate average rating
gasStationSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) return 0;
  
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  return Math.round((totalRating / this.reviews.length) * 10) / 10; // Round to 1 decimal place
};

// Method to update status
gasStationSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  
  if (newStatus === 'active' && !this.isVerified) {
    this.isVerified = true;
    this.verifiedBy = updatedBy;
    this.verifiedAt = new Date();
  }
  
  return this.save();
};

// Static method to find nearby stations
gasStationSchema.statics.findNearby = function(lat, lng, radius = 5000, limit = 20) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: radius
      }
    },
    status: 'active',
    isArchived: false
  }).limit(limit);
};

// Static method to find stations by brand
gasStationSchema.statics.findByBrand = function(brand) {
  return this.find({ 
    brand: new RegExp(brand, 'i'),
    status: 'active',
    isArchived: false 
  });
};

// Static method to get station statistics
gasStationSchema.statics.getStationStats = function() {
  return this.aggregate([
    { $match: { isArchived: false } },
    {
      $group: {
        _id: null,
        totalStations: { $sum: 1 },
        activeStations: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        verifiedStations: { $sum: { $cond: ['$isVerified', 1, 0] } },
        avgRating: { $avg: '$stats.averageRating' },
        totalReviews: { $sum: '$stats.totalReviews' }
      }
    }
  ]);
};

// Static method to get stations by city
gasStationSchema.statics.findByCity = function(city) {
  return this.find({ 
    'location.city': new RegExp(city, 'i'),
    status: 'active',
    isArchived: false 
  });
};

module.exports = mongoose.model('GasStation', gasStationSchema);
