const mongoose = require('mongoose');

const gasStationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    trim: true
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
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    trim: true,
    default: 'Philippines'
  },
  postalCode: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  website: {
    type: String,
    trim: true
  },
  services: [{
    type: String,
    enum: ['fuel', 'car_wash', 'convenience_store', 'restaurant', 'atm', 'air_pump', 'tire_service']
  }],
  fuelTypes: [{
    type: String,
    enum: ['gasoline', 'diesel', 'premium_gasoline', 'premium_diesel', 'lpg']
  }],
  prices: [{
    fuelType: {
      type: String,
      enum: ['gasoline', 'diesel', 'premium_gasoline', 'premium_diesel', 'lpg']
    },
    price: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'PHP'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
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
  amenities: [{
    type: String,
    enum: ['parking', 'restroom', 'wifi', 'security', 'lighting', 'covered', 'accessible']
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Geospatial index for location queries
gasStationSchema.index({ location: '2dsphere' });
gasStationSchema.index({ name: 1 });
gasStationSchema.index({ brand: 1 });
gasStationSchema.index({ city: 1 });
gasStationSchema.index({ isActive: 1 });

// Virtual for full address
gasStationSchema.virtual('fullAddress').get(function() {
  const parts = [this.address];
  if (this.city) parts.push(this.city);
  if (this.state) parts.push(this.state);
  if (this.postalCode) parts.push(this.postalCode);
  if (this.country) parts.push(this.country);
  return parts.join(', ');
});

// Method to update price
gasStationSchema.methods.updatePrice = function(fuelType, price) {
  const existingPrice = this.prices.find(p => p.fuelType === fuelType);
  if (existingPrice) {
    existingPrice.price = price;
    existingPrice.lastUpdated = new Date();
  } else {
    this.prices.push({
      fuelType,
      price,
      lastUpdated: new Date()
    });
  }
  this.lastUpdated = new Date();
  return this.save();
};

// Method to get current price
gasStationSchema.methods.getCurrentPrice = function(fuelType) {
  const price = this.prices.find(p => p.fuelType === fuelType);
  return price ? price.price : null;
};

// Method to check if open
gasStationSchema.methods.isOpen = function() {
  const now = new Date();
  const day = now.toLocaleLowerCase().substring(0, 3);
  const hours = this.operatingHours[day];
  
  if (!hours) return false;
  if (hours.is24Hours) return true;
  
  const currentTime = now.toTimeString().substring(0, 5);
  return currentTime >= hours.open && currentTime <= hours.close;
};

// Static method to find nearby gas stations
gasStationSchema.statics.findNearby = function(latitude, longitude, radiusInKm = 5) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('GasStation', gasStationSchema);
