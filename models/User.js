const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Location Information
  city: { 
    type: String, 
    required: true 
  },
  province: { 
    type: String, 
    required: true 
  },
  barangay: { 
    type: String, 
    required: true 
  },
  street: { 
    type: String, 
    required: true 
  },
  location: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  
  // User Preferences
  preferences: {
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  
  // Account Status
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Verification & Reset
  verifyToken: {
    type: String
  },
  resetToken: {
    type: String
  },
  resetTokenExpiry: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  otpCode: String,
  otpExpires: Date,
  
  // Activity Tracking
  lastLogin: {
    type: Date
  },
  
  // Custom ID for legacy support
  id: { 
    type: String, 
    unique: true 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
// Email index is automatically created by unique: true
userSchema.index({ isActive: 1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ role: 1 });

// Combined pre-save hook for ID generation + password hashing
userSchema.pre('save', async function(next) {
  try {
    // Generate custom ID if not exists
    if (!this.id) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');

      const count = await this.constructor.countDocuments({
        id: new RegExp(`^${year}${month}${day}`)
      });

      this.id = `${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
    }

    // Hash password if modified
    if (this.isModified('password')) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (err) {
    console.error('Pre-save hook error:', err);
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Legacy method for backward compatibility
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove sensitive data from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  delete user.verifyToken;
  return user;
};

module.exports = mongoose.model('User', userSchema);