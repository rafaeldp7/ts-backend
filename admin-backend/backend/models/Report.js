const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  // User reference - support both userId (legacy) and reporter (admin)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  reportType: {
    type: String,
    enum: ["Accident", "Traffic Jam", "Road Closure", "Hazard"],
    required: true,
  },
  // Support both title and description
  title: {
    type: String,
    maxlength: 200,
    required: false,
  },
  description: {
    type: String,
    maxlength: 2000,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  geocodedAddress: {
    type: String,
    required: false,
  },
  // Location with both formats for compatibility
  location: {
    // Legacy format
    latitude: { type: Number, required: false },
    longitude: { type: Number, required: false },
    // Admin format
    address: { type: String, required: false },
    barangay: { type: String, required: false },
    city: { type: String, required: false },
    province: { type: String, required: false },
    coordinates: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
  },
  // Status field for admin workflow
  status: {
    type: String,
    enum: ["pending", "verified", "resolved"],
    default: "pending",
  },
  // Priority field
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  // Verification tracking
  verified: {
    verifiedByAdmin: { type: Number, default: 0 },
    verifiedByUser: { type: Number, default: 0 },
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  verifiedAt: {
    type: Date,
    required: false,
  },
  // Resolution tracking
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  resolvedAt: {
    type: Date,
    required: false,
  },
  resolutionActions: [{
    type: String,
  }],
  // Comments system
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  // Voting system
  votes: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    vote: { type: Number, enum: [1, -1], required: true },
  }],
  // Attachments
  attachments: [{
    type: {
      type: String,
      enum: ["image", "video", "document"],
    },
    filename: String,
    url: String,
  }],
  // Archive system - support both formats
  archived: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
    required: false,
  },
  archivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  // Timestamps - support both formats
  timestamp: {
    type: Date,
    default: Date.now,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
  // Views tracking
  views: {
    type: Number,
    default: 0,
  },
  // Geocoding
  geocodingStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  geocodingError: {
    type: String,
    required: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
});

// Virtual for total votes
reportSchema.virtual("totalVotes").get(function () {
  return this.votes.reduce((sum, v) => sum + v.vote, 0);
});

// Virtual for display address (prioritizes geocoded address)
reportSchema.virtual("displayAddress").get(function () {
  return this.geocodedAddress || this.address || this.location?.address || "Address not available";
});

// Pre-save middleware to sync fields
reportSchema.pre('save', async function(next) {
  // Sync userId and reporter
  if (this.reporter && !this.userId) {
    this.userId = this.reporter;
  }
  if (this.userId && !this.reporter) {
    this.reporter = this.userId;
  }

  // Sync archived and isArchived
  if (this.archived !== undefined) {
    this.isArchived = this.archived;
  }
  if (this.isArchived !== undefined) {
    this.archived = this.isArchived;
  }

  // Sync timestamp and reportedAt
  if (this.timestamp && !this.reportedAt) {
    this.reportedAt = this.timestamp;
  }
  if (this.reportedAt && !this.timestamp) {
    this.timestamp = this.reportedAt;
  }

  // Sync location formats
  if (this.location) {
    // If we have coordinates.lat/lng, sync to latitude/longitude
    if (this.location.coordinates?.lat && !this.location.latitude) {
      this.location.latitude = this.location.coordinates.lat;
    }
    if (this.location.coordinates?.lng && !this.location.longitude) {
      this.location.longitude = this.location.coordinates.lng;
    }
    // If we have latitude/longitude, sync to coordinates
    if (this.location.latitude && !this.location.coordinates?.lat) {
      if (!this.location.coordinates) {
        this.location.coordinates = {};
      }
      this.location.coordinates.lat = this.location.latitude;
    }
    if (this.location.longitude && !this.location.coordinates?.lng) {
      if (!this.location.coordinates) {
        this.location.coordinates = {};
      }
      this.location.coordinates.lng = this.location.longitude;
    }
  }

  // Sync title and description
  if (this.title && !this.description) {
    this.description = this.title;
  }
  if (this.description && !this.title) {
    this.title = this.description.substring(0, 200);
  }

  // Auto reverse geocode if coordinates are provided
  if (this.location && (this.location.latitude || this.location.coordinates?.lat) && 
      !this.geocodedAddress && this.geocodingStatus === 'pending') {
    try {
      await this.reverseGeocode();
    } catch (error) {
      // Don't fail the save operation if geocoding fails
      console.warn('Reverse geocoding failed during save:', error.message);
    }
  }

  next();
});

// Instance method: Increment views
reportSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  await this.save();
  return this.views;
};

// Instance method: Update status
reportSchema.methods.updateStatus = async function(status, userId, notes) {
  const validStatuses = ['pending', 'verified', 'resolved'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  this.status = status;

  if (status === 'verified') {
    this.verifiedBy = userId;
    this.verifiedAt = new Date();
    this.verified.verifiedByAdmin = (this.verified.verifiedByAdmin || 0) + 1;
  } else if (status === 'resolved') {
    this.resolvedBy = userId;
    this.resolvedAt = new Date();
  }

  // Add note as a comment if provided
  if (notes) {
    await this.addComment(userId, notes);
  }

  await this.save();
  return this;
};

// Instance method: Add comment
reportSchema.methods.addComment = async function(userId, content) {
  if (!content || !content.trim()) {
    throw new Error('Comment content is required');
  }

  this.comments.push({
    author: userId,
    content: content.trim(),
    createdAt: new Date(),
  });

  await this.save();
  return this.comments[this.comments.length - 1];
};

// Instance method: Reverse geocode
reportSchema.methods.reverseGeocode = async function() {
  try {
    const lat = this.location?.coordinates?.lat || this.location?.latitude;
    const lng = this.location?.coordinates?.lng || this.location?.longitude;
    
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required for reverse geocoding');
    }

    // Use Google Maps Geocoding API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      this.geocodedAddress = result.formatted_address;
      this.geocodingStatus = 'success';
      this.geocodingError = null;
      
      // Parse address components
      if (!this.location.address) {
        this.location.address = result.formatted_address;
      }

      // Extract city, province, etc. from address components
      result.address_components.forEach(component => {
        if (component.types.includes('locality') || component.types.includes('administrative_area_level_2')) {
          this.location.city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
          this.location.province = component.long_name;
        }
        if (component.types.includes('sublocality_level_1') || component.types.includes('neighborhood')) {
          this.location.barangay = component.long_name;
        }
      });
      
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

// Static method: Find reports by location
reportSchema.statics.findByLocation = async function(lat, lng, radius = 1000) {
  // Convert radius from meters to degrees (approximate)
  // 1 degree latitude ≈ 111,000 meters
  const latDelta = radius / 111000;
  // Longitude delta depends on latitude
  const lngDelta = radius / (111000 * Math.cos(lat * Math.PI / 180));

  const reports = await this.find({
    $and: [
      {
        $or: [
          {
            'location.latitude': {
              $gte: lat - latDelta,
              $lte: lat + latDelta,
            },
            'location.longitude': {
              $gte: lng - lngDelta,
              $lte: lng + lngDelta,
            },
          },
          {
            'location.coordinates.lat': {
              $gte: lat - latDelta,
              $lte: lat + latDelta,
            },
            'location.coordinates.lng': {
              $gte: lng - lngDelta,
              $lte: lng + lngDelta,
            },
          },
        ],
      },
      {
        $or: [
          { isArchived: { $ne: true } },
          { archived: { $ne: true } },
          { isArchived: { $exists: false } },
          { archived: { $exists: false } },
        ],
      },
    ],
  })
    .populate('reporter', 'firstName lastName email')
    .populate('userId', 'firstName lastName email')
    .sort({ reportedAt: -1, timestamp: -1 });

  return reports;
};

// Static method: Get report statistics
reportSchema.statics.getReportStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        pendingReports: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
          },
        },
        verifiedReports: {
          $sum: {
            $cond: [{ $eq: ['$status', 'verified'] }, 1, 0],
          },
        },
        resolvedReports: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0],
          },
        },
        archivedReports: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ['$isArchived', true] },
                  { $eq: ['$archived', true] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  // Calculate average resolution time
  const resolvedReports = await this.find({
    status: 'resolved',
    resolvedAt: { $exists: true },
    reportedAt: { $exists: true },
  });

  let totalResolutionTime = 0;
  let resolvedCount = 0;

  resolvedReports.forEach(report => {
    const reportedAt = report.reportedAt || report.timestamp || report.createdAt;
    const resolvedAt = report.resolvedAt;
    if (reportedAt && resolvedAt) {
      const diffDays = (resolvedAt - reportedAt) / (1000 * 60 * 60 * 24);
      totalResolutionTime += diffDays;
      resolvedCount++;
    }
  });

  const avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

  if (stats.length > 0) {
    stats[0].avgResolutionTime = avgResolutionTime;
  } else {
    stats.push({
      totalReports: 0,
      pendingReports: 0,
      verifiedReports: 0,
      resolvedReports: 0,
      archivedReports: 0,
      avgResolutionTime: 0,
    });
  }

  return stats;
};

// Static method: Get reports by type
reportSchema.statics.getReportsByType = async function() {
  const reportsByType = await this.aggregate([
    {
      $group: {
        _id: '$reportType',
        count: { $sum: 1 },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
          },
        },
        verified: {
          $sum: {
            $cond: [{ $eq: ['$status', 'verified'] }, 1, 0],
          },
        },
        resolved: {
          $sum: {
            $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return reportsByType;
};

// Static method: Reverse geocode multiple reports
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

// Indexes for performance
reportSchema.index({ "votes.userId": 1 });
reportSchema.index({ "location.latitude": 1, "location.longitude": 1 });
reportSchema.index({ "location.coordinates.lat": 1, "location.coordinates.lng": 1 });
reportSchema.index({ "geocodingStatus": 1 });
reportSchema.index({ "status": 1 });
reportSchema.index({ "reportType": 1 });
reportSchema.index({ "priority": 1 });
reportSchema.index({ "isArchived": 1 });
reportSchema.index({ "archived": 1 });
reportSchema.index({ "reportedAt": -1 });
reportSchema.index({ "timestamp": -1 });
reportSchema.index({ "reporter": 1 });
reportSchema.index({ "userId": 1 });

module.exports = mongoose.model("Report", reportSchema);

