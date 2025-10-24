const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Report Information
  reportType: {
    type: String,
    required: [true, 'Report type is required'],
    enum: ['Accident', 'Traffic Jam', 'Road Closure', 'Hazard', 'Construction', 'Other'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  
  // Reporter Information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  
  // Report Status
  status: {
    type: String,
    enum: ['pending', 'verified', 'in-progress', 'resolved', 'false-alarm', 'archived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Verification Information
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verifiedAt: Date,
  verificationNotes: String,
  
  // Resolution Information
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolvedAt: Date,
  resolutionNotes: String,
  resolutionActions: [String],
  
  // Media Attachments
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: String,
    mimeType: String,
    size: Number,
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Impact Assessment
  impact: {
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'major', 'severe'],
      default: 'moderate'
    },
    affectedArea: {
      type: String,
      enum: ['local', 'neighborhood', 'district', 'city-wide'],
      default: 'local'
    },
    estimatedDuration: {
      type: Number, // in minutes
      default: 30
    },
    trafficImpact: {
      type: String,
      enum: ['none', 'light', 'moderate', 'heavy', 'severe'],
      default: 'moderate'
    }
  },
  
  // Statistics
  stats: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    confirmations: { type: Number, default: 0 },
    reports: { type: Number, default: 0 } // Number of users who reported the same issue
  },
  
  // Tags and Categories
  tags: [String],
  category: {
    type: String,
    enum: ['traffic', 'safety', 'infrastructure', 'environment', 'other'],
    default: 'traffic'
  },
  
  // Time Information
  reportedAt: {
    type: Date,
    default: Date.now
  },
  estimatedResolutionTime: Date,
  actualResolutionTime: Date,
  
  // Related Reports
  relatedReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  
  // Comments and Updates
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    isOfficial: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
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
reportSchema.index({ reportType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ 'location.coordinates': '2dsphere' });
reportSchema.index({ reporter: 1 });
reportSchema.index({ verifiedBy: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ reportedAt: -1 });
reportSchema.index({ tags: 1 });
reportSchema.index({ category: 1 });

// Virtual for age of report
reportSchema.virtual('age').get(function() {
  const now = new Date();
  const reported = this.reportedAt || this.createdAt;
  return Math.floor((now - reported) / (1000 * 60 * 60)); // Age in hours
});

// Virtual for resolution time
reportSchema.virtual('resolutionTime').get(function() {
  if (!this.resolvedAt || !this.reportedAt) return null;
  return Math.floor((this.resolvedAt - this.reportedAt) / (1000 * 60)); // Resolution time in minutes
});

// Method to update status
reportSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '') {
  this.status = newStatus;
  
  if (newStatus === 'verified' && !this.verifiedAt) {
    this.verifiedAt = new Date();
    this.verifiedBy = updatedBy;
    this.verificationNotes = notes;
  }
  
  if (newStatus === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
    this.resolvedBy = updatedBy;
    this.resolutionNotes = notes;
  }
  
  return this.save();
};

// Method to add comment
reportSchema.methods.addComment = function(author, content, isOfficial = false) {
  this.comments.push({
    author,
    content,
    isOfficial,
    createdAt: new Date()
  });
  return this.save();
};

// Method to increment views
reportSchema.methods.incrementViews = function() {
  this.stats.views += 1;
  return this.save();
};

// Static method to find reports by location
reportSchema.statics.findByLocation = function(lat, lng, radius = 1000) {
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
    isPublic: true,
    isArchived: false
  });
};

// Static method to get report statistics
reportSchema.statics.getReportStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        pendingReports: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        verifiedReports: { $sum: { $cond: [{ $eq: ['$status', 'verified'] }, 1, 0] } },
        resolvedReports: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgResolutionTime: { $avg: '$resolutionTime' }
      }
    }
  ]);
};

// Static method to get reports by type
reportSchema.statics.getReportsByType = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$reportType',
        count: { $sum: 1 },
        avgResolutionTime: { $avg: '$resolutionTime' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Report', reportSchema);
