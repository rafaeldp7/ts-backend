const User = require('../models/User');
const bcrypt = require('bcryptjs');

class AdminController {
  // Get all admins (users with admin role)
  async getAdmins(req, res) {
    try {
      const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      // Build filter for admin users
      const filter = { role: 'admin' };
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort options
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const admins = await User.find(filter)
        .select('-password')
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(filter);

      res.json({
        admins,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
      res.status(500).json({ 
        error: 'Failed to fetch admins',
        message: error.message 
      });
    }
  }

  // Create new admin
  async createAdmin(req, res) {
    try {
      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create admin user
      const admin = new User({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'admin',
        isActive: true,
        preferences: {
          units: 'metric',
          language: 'en',
          notifications: true
        }
      });

      await admin.save();

      res.status(201).json({
        message: 'Admin created successfully',
        admin: {
          _id: admin._id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          phone: admin.phone,
          role: admin.role,
          isActive: admin.isActive,
          createdAt: admin.createdAt
        }
      });
    } catch (error) {
      console.error('Error creating admin:', error);
      res.status(500).json({ 
        error: 'Failed to create admin',
        message: error.message 
      });
    }
  }

  // Update admin role
  async updateAdminRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const admin = await User.findByIdAndUpdate(
        id,
        { role, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({
        message: 'Admin role updated successfully',
        admin
      });
    } catch (error) {
      console.error('Error updating admin role:', error);
      res.status(500).json({ 
        error: 'Failed to update admin role',
        message: error.message 
      });
    }
  }

  // Deactivate admin
  async deactivateAdmin(req, res) {
    try {
      const { id } = req.params;

      const admin = await User.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      ).select('-password');

      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      res.json({
        message: 'Admin deactivated successfully',
        admin
      });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      res.status(500).json({ 
        error: 'Failed to deactivate admin',
        message: error.message 
      });
    }
  }

  // Get admin activity logs (placeholder - would need AdminLog model)
  async getAdminLogs(req, res) {
    try {
      const { page = 1, limit = 50, adminId, action, resource } = req.query;
      
      // This would require an AdminLog model to be implemented
      // For now, return empty logs
      res.json({
        logs: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch admin logs',
        message: error.message 
      });
    }
  }

  // Get current admin's activity logs
  async getMyAdminLogs(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;
      
      // This would require an AdminLog model to be implemented
      // For now, return empty logs
      res.json({
        logs: [],
        totalPages: 0,
        currentPage: page,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching admin logs:', error);
      res.status(500).json({ 
        error: 'Failed to fetch admin logs',
        message: error.message 
      });
    }
  }
}

module.exports = new AdminController();
