const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  reportType: {
    type: String,
    enum: ["Accident", "Traffic Jam", "Road Closure", "Hazard"],
    required: true,
  },
  description: {
    type: String,
    maxlength: 500, // allow longer description
    required: true,
  },
  address: {
    type: String,
    required: false, // Made optional since we'll auto-generate from coordinates
  },
  geocodedAddress: {
    type: String,
    required: false,
  },
  verified: {
    verifiedByAdmin: { type: Number, required: true },
    verifiedByUser: { type: Number, required: true },
  },
  votes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      vote: { type: Number, enum: [1, -1], required: true },
    },
  ],
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  archived: { // New field
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  geocodingStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  geocodingError: {
    type: String,
    required: false,
  },
});

// Optional: Virtual for total votes
reportSchema.virtual("totalVotes").get(function () {
  return this.votes.reduce((sum, v) => sum + v.vote, 0);
});

// Virtual for display address (prioritizes geocoded address)
reportSchema.virtual("displayAddress").get(function () {
  return this.geocodedAddress || this.address || "Address not available";
});

// Reverse geocoding method
reportSchema.methods.reverseGeocode = async function() {
  try {
    const { latitude, longitude } = this.location;
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required for reverse geocoding');
    }

    // Use Google Maps Geocoding API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      this.geocodedAddress = result.formatted_address;
      this.geocodingStatus = 'success';
      this.geocodingError = null;
      
      // If no manual address was provided, use the geocoded one
      if (!this.address) {
        this.address = result.formatted_address;
      }
      
      return result.formatted_address;
    } else {
      throw new Error(`Geocoding failed: ${data.status} - ${data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    this.geocodingStatus = 'failed';
    this.geocodingError = error.message;
    console.error('Reverse geocoding error:', error);
    throw error;
  }
};

// Static method to reverse geocode multiple reports
reportSchema.statics.reverseGeocodeReports = async function(reportIds) {
  const reports = await this.find({ _id: { $in: reportIds } });
  const results = [];
  
  for (const report of reports) {
    try {
      const address = await report.reverseGeocode();
      await report.save();
      results.push({ reportId: report._id, success: true, address });
    } catch (error) {
      results.push({ reportId: report._id, success: false, error: error.message });
    }
  }
  
  return results;
};

// Pre-save middleware to automatically reverse geocode if coordinates are provided
reportSchema.pre('save', async function(next) {
  // Only reverse geocode if we have coordinates but no geocoded address
  if (this.location.latitude && this.location.longitude && !this.geocodedAddress && this.geocodingStatus === 'pending') {
    try {
      await this.reverseGeocode();
    } catch (error) {
      // Don't fail the save operation if geocoding fails
      console.warn('Reverse geocoding failed during save:', error.message);
    }
  }
  next();
});

// Optional index for faster vote lookups
reportSchema.index({ "votes.userId": 1 });
reportSchema.index({ "location.latitude": 1, "location.longitude": 1 });
reportSchema.index({ "geocodingStatus": 1 });

module.exports = mongoose.model("Report", reportSchema);
