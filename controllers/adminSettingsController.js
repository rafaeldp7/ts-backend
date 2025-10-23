const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const Report = require('../models/Reports');
const Trip = require('../models/TripModel');
const GasStation = require('../models/GasStation');

class AdminSettingsController {
  // Get dashboard settings
  async getDashboardSettings(req, res) {
    try {
      // For now, return default settings
      // In a real implementation, you might store these in a settings collection
      const settings = {
        widgets: {
          userStats: true,
          reportStats: true,
          tripStats: true,
          gasStationStats: true,
          recentActivity: true,
          systemHealth: true
        },
        refreshInterval: 30000, // 30 seconds
        theme: 'light',
        notifications: {
          newUsers: true,
          newReports: true,
          systemAlerts: true
        }
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'SETTINGS', null, null, {
        description: 'Retrieved dashboard settings'
      });

      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error fetching dashboard settings:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'SETTINGS', null, null, {
        description: 'Failed to retrieve dashboard settings',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard settings' });
    }
  }

  // Update dashboard settings
  async updateDashboardSettings(req, res) {
    try {
      const { widgets, refreshInterval, theme, notifications } = req.body;

      // In a real implementation, you would save these to a settings collection
      const settings = {
        widgets: widgets || {},
        refreshInterval: refreshInterval || 30000,
        theme: theme || 'light',
        notifications: notifications || {}
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'SETTINGS', null, null, {
        description: 'Updated dashboard settings',
        settings: settings
      });

      res.json({ success: true, data: settings });
    } catch (error) {
      console.error('Error updating dashboard settings:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'SETTINGS', null, null, {
        description: 'Failed to update dashboard settings',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to update dashboard settings' });
    }
  }

  // Get system statistics
  async getSystemStats(req, res) {
    try {
      const [
        totalUsers,
        totalReports,
        totalTrips,
        totalGasStations,
        newUsersThisMonth,
        newReportsThisMonth,
        newTripsThisMonth,
        activeAdmins
      ] = await Promise.all([
        User.countDocuments(),
        Report.countDocuments(),
        Trip.countDocuments(),
        GasStation.countDocuments(),
        User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Report.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Trip.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
        Admin.countDocuments({ isActive: true })
      ]);

      const stats = {
        totalUsers,
        totalReports,
        totalTrips,
        totalGasStations,
        newUsersThisMonth,
        newReportsThisMonth,
        newTripsThisMonth,
        activeAdmins,
        systemHealth: {
          database: 'healthy',
          api: 'healthy',
          uptime: process.uptime()
        }
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Retrieved system statistics'
      });

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching system stats:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Failed to retrieve system statistics',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch system stats' });
    }
  }

  // Get activity summary
  async getActivitySummary(req, res) {
    try {
      const { days = 7 } = req.query;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalLogs,
        successfulLogs,
        failedLogs,
        criticalLogs,
        recentActivity
      ] = await Promise.all([
        AdminLog.countDocuments({ timestamp: { $gte: startDate } }),
        AdminLog.countDocuments({ timestamp: { $gte: startDate }, status: 'SUCCESS' }),
        AdminLog.countDocuments({ timestamp: { $gte: startDate }, status: 'FAILED' }),
        AdminLog.countDocuments({ timestamp: { $gte: startDate }, severity: 'CRITICAL' }),
        AdminLog.find({ timestamp: { $gte: startDate } })
          .sort({ timestamp: -1 })
          .limit(10)
          .populate('adminId', 'firstName lastName email')
      ]);

      const summary = {
        totalLogs,
        successfulLogs,
        failedLogs,
        criticalLogs,
        successRate: totalLogs > 0 ? (successfulLogs / totalLogs) * 100 : 0,
        recentActivity
      };

      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Retrieved activity summary',
        days: days
      });

      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error fetching activity summary:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'READ', 'ANALYTICS', null, null, {
        description: 'Failed to retrieve activity summary',
        error: error.message
      }, 'FAILED', 'HIGH');
      res.status(500).json({ success: false, error: 'Failed to fetch activity summary' });
    }
  }

  // Reset admin password
  async resetAdminPassword(req, res) {
    try {
      const { adminId } = req.params;
      const { newPassword } = req.body;

      const admin = await Admin.findById(adminId);
      if (!admin) {
        await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, null, {
          description: 'Attempted to reset password for non-existent admin'
        }, 'FAILED', 'MEDIUM');
        return res.status(404).json({ success: false, error: 'Admin not found' });
      }

      // Update password
      admin.password = newPassword;
      admin.updatedAt = Date.now();
      await admin.save();

      // Log password reset
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', adminId, admin.fullName, {
        description: `Password reset for admin: ${admin.email}`,
        targetAdmin: admin.email
      }, 'SUCCESS', 'HIGH');

      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      console.error('Error resetting admin password:', error);
      await this.logAdminActivity(req.admin.id, req.admin.email, 'UPDATE', 'ADMIN', req.params.adminId, null, {
        description: 'Failed to reset admin password',
        error: error.message
      }, 'FAILED', 'CRITICAL');
      res.status(500).json({ success: false, error: 'Failed to reset password' });
    }
  }

  // Helper method to log admin activity
  async logAdminActivity(adminId, adminEmail, action, resource, resourceId, resourceName, details, status = 'SUCCESS', severity = 'MEDIUM') {
    try {
      const log = new AdminLog({
        adminId,
        adminName: adminEmail ? adminEmail.split('@')[0] : 'Unknown',
        adminEmail,
        action,
        resource,
        resourceId,
        resourceName,
        details,
        status,
        severity
      });

      await log.save();
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
}

module.exports = new AdminSettingsController();