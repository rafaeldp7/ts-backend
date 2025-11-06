const mongoose = require('mongoose');

// Price history sub-schema
const priceHistorySchema = new mongoose.Schema({
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'premium_gasoline', 'premium_diesel', 'lpg'],
    required: true
  },
  oldPrice: {
    type: Number,
    required: true
  },
  newPrice: {
    type: Number,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

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
    required: function() {
      // Address is only required if coordinates are not provided
      return !this.location || !this.location.coordinates || this.location.coordinates.length === 0;
    },
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
  priceHistory: [priceHistorySchema],
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
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

// Virtual for address from coordinates
gasStationSchema.virtual('addressFromCoords').get(function() {
  if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
    return null;
  }
  
  const [lng, lat] = this.location.coordinates;
  
  // Format coordinates for display
  return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
});

// Virtual for formatted coordinates
gasStationSchema.virtual('formattedCoordinates').get(function() {
  if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
    return null;
  }
  
  const [lng, lat] = this.location.coordinates;
  return {
    latitude: lat,
    longitude: lng,
    formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  };
});

// Virtual for Google Maps link
gasStationSchema.virtual('googleMapsLink').get(function() {
  if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
    return null;
  }
  
  const [lng, lat] = this.location.coordinates;
  return `https://www.google.com/maps?q=${lat},${lng}`;
});

// Virtual for formatted price history
gasStationSchema.virtual('priceHistoryFormatted').get(function() {
  return this.priceHistory.map(h => ({
    fuelType: h.fuelType,
    from: h.oldPrice,
    to: h.newPrice,
    updatedBy: h.updatedBy,
    date: h.updatedAt.toLocaleString()
  }));
});

// Method to update price with history tracking
gasStationSchema.methods.updatePrice = async function(fuelType, newPrice, userId) {
  const existingPrice = this.prices.find(p => p.fuelType === fuelType);
  let oldPrice = null;
  
  if (existingPrice) {
    oldPrice = existingPrice.price;
    existingPrice.price = newPrice;
    existingPrice.lastUpdated = new Date();
  } else {
    this.prices.push({
      fuelType,
      price: newPrice,
      lastUpdated: new Date()
    });
  }
  
  // Only add to history if price actually changed
  if (oldPrice !== newPrice) {
    this.priceHistory.push({
      fuelType,
      oldPrice: oldPrice ?? 0,
      newPrice,
      updatedBy: userId,
      updatedAt: new Date()
    });
  }
  
  this.lastUpdated = new Date();
  await this.save();
  return this;
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

// Method to get address from coordinates using reverse geocoding
// Uses Google Maps Geocoding API to convert coordinates to address
gasStationSchema.methods.getAddressFromCoordinates = async function() {
  if (!this.location || !this.location.coordinates || this.location.coordinates.length !== 2) {
    return {
      success: false,
      message: 'No coordinates available'
    };
  }
  
  const [lng, lat] = this.location.coordinates;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      message: 'Google Maps API key not configured',
      fallback: {
        formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: {
          latitude: lat,
          longitude: lng
        }
      }
    };
  }
  
  try {
    const axios = require('axios');
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        latlng: `${lat},${lng}`,
        key: apiKey,
        language: 'en'
      }
    });
    
    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      
      // Extract address components
      const components = result.address_components || [];
      const city = components.find(c => c.types.includes('locality') || c.types.includes('administrative_area_level_2'))?.long_name;
      const state = components.find(c => c.types.includes('administrative_area_level_1'))?.long_name;
      const country = components.find(c => c.types.includes('country'))?.long_name;
      const postalCode = components.find(c => c.types.includes('postal_code'))?.long_name;
      
      return {
        success: true,
        formattedAddress: result.formatted_address,
        address: {
          full: result.formatted_address,
          street: result.address_components.find(c => c.types.includes('route'))?.long_name || '',
          city: city || '',
          state: state || '',
          country: country || '',
          postalCode: postalCode || ''
        },
        coordinates: {
          latitude: lat,
          longitude: lng
        },
        placeId: result.place_id,
        types: result.types
      };
    } else {
      return {
        success: false,
        message: response.data.error_message || 'Geocoding failed',
        fallback: {
          formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          coordinates: {
            latitude: lat,
            longitude: lng
          }
        }
      };
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return {
      success: false,
      message: 'Reverse geocoding failed',
      error: error.message,
      fallback: {
        formatted: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        coordinates: {
          latitude: lat,
          longitude: lng
        }
      }
    };
  }
};

// Virtual that performs reverse geocoding
gasStationSchema.virtual('reverseGeocodedAddress').get(async function() {
  // Note: This won't work directly as a getter virtual with async
  // Use the method getAddressFromCoordinates() instead
  return null;
});

// Pre-save middleware to automatically reverse geocode if only coordinates are provided
gasStationSchema.pre('save', async function(next) {
  // Only reverse geocode if we have coordinates but no address (or empty address)
  if (this.location && 
      this.location.coordinates && 
      this.location.coordinates.length === 2 && 
      (!this.address || this.address.trim() === '')) {
    
    try {
      // Get address from coordinates
      const addressInfo = await this.getAddressFromCoordinates();
      
      // If geocoding succeeds, populate address fields
      if (addressInfo.success) {
        this.address = addressInfo.formattedAddress;
        this.city = addressInfo.address.city;
        this.state = addressInfo.address.state;
        this.country = addressInfo.address.country;
        this.postalCode = addressInfo.address.postalCode;
        
        console.log('✅ Auto-reverse geocoded gas station address');
      } else {
        // If geocoding fails, use coordinates as fallback
        this.address = `${addressInfo.fallback.formatted}`;
        console.log('⚠️ Reverse geocoding failed, using coordinates as fallback');
      }
    } catch (error) {
      // Don't fail the save operation if geocoding fails
      console.warn('⚠️ Reverse geocoding failed during save:', error.message);
      
      // Set fallback address using coordinates
      const [lng, lat] = this.location.coordinates;
      this.address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }
  
  next();
});

module.exports = mongoose.model('GasStation', gasStationSchema);
