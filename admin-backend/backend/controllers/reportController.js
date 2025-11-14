const Report = require('../../../models/Reports');
const User = require('../../../models/User');
const Notification = require('../../../models/Notification');
const { logAdminAction } = require('./adminLogsController');
const { sendErrorResponse, sendSuccessResponse } = require('../middleware/validation');

// Get all reports with filtering and pagination
const getReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      city,
      barangay,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // Build filter object - exclude archived reports
    const filter = {
      $and: [
        {
          $or: [
            { isArchived: { $ne: true } },
            { archived: { $ne: true } },
            { isArchived: { $exists: false } },
            { archived: { $exists: false } }
          ]
        }
      ]
    };

    if (status) filter.status = status;
    if (type) filter.reportType = type;
    if (priority) filter.priority = priority;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (barangay) filter['location.barangay'] = new RegExp(barangay, 'i');
    
    if (dateFrom || dateTo) {
      const dateFilter = {
        $or: []
      };
      if (dateFrom && dateTo) {
        dateFilter.$or.push(
          { reportedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) } },
          { timestamp: { $gte: new Date(dateFrom), $lte: new Date(dateTo) } }
        );
      } else if (dateFrom) {
        dateFilter.$or.push(
          { reportedAt: { $gte: new Date(dateFrom) } },
          { timestamp: { $gte: new Date(dateFrom) } }
        );
      } else if (dateTo) {
        dateFilter.$or.push(
          { reportedAt: { $lte: new Date(dateTo) } },
          { timestamp: { $lte: new Date(dateTo) } }
        );
      }
      filter.$and.push(dateFilter);
    }
    
    if (search) {
      const searchFilter = {
        $or: [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { 'location.address': new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') }
        ]
      };
      filter.$and.push(searchFilter);
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'firstName lastName email')
      .populate('userId', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ reportedAt: -1, timestamp: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(filter);

    sendSuccessResponse(res, {
      reports,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    sendErrorResponse(res, 500, 'Failed to get reports', error);
  }
};

// Get single report
const getReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'firstName lastName email phone')
      .populate('userId', 'firstName lastName email phone')
      .populate('verifiedBy', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .populate('comments.author', 'firstName lastName');

    if (!report) {
      return sendErrorResponse(res, 404, 'Report not found');
    }

    // Increment views
    await report.incrementViews();

    sendSuccessResponse(res, { report });
  } catch (error) {
    console.error('Get report error:', error);
    sendErrorResponse(res, 500, 'Failed to get report', error);
  }
};

// Create new report
const createReport = async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      reporter: req.user.id
    };

    const report = new Report(reportData);
    await report.save();

    // Populate reporter information
    await report.populate('reporter', 'firstName lastName email');

    // Send notification to admins (simplified - in real app, you'd notify specific admins)
    // This would typically be handled by a notification service

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create report',
      error: error.message
    });
  }
};

// Update report
const updateReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can update (only reporter or admin)
    // Since this route uses authenticateAdmin, user is always admin
    // Allow admin to update any report (remove restriction for admin)
    // The check below was too restrictive - admins should be able to update all reports

    // Store original report data for logging
    const originalReport = {
      title: report.title,
      description: report.description,
      status: report.status,
      priority: report.priority,
      reportType: report.reportType
    };

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        report[key] = req.body[key];
      }
    });

    await report.save();

    // Log the report update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'REPORT',
        {
          description: `Updated report: "${report.title}" (ID: ${report._id})`,
          reportId: report._id,
          reportTitle: report.title,
          reportType: report.reportType,
          changes: req.body,
          originalStatus: originalReport.status,
          newStatus: report.status
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report',
      error: error.message
    });
  }
};

// Delete report
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user can delete (only reporter or admin)
    // Since this route uses authenticateAdmin, user is always admin
    // Allow admin to delete any report (remove restriction for admin)
    // The check below was too restrictive - admins should be able to delete all reports

    // Store report data for logging before deletion
    const reportData = {
      id: report._id,
      title: report.title,
      description: report.description,
      status: report.status,
      priority: report.priority,
      reportType: report.reportType
    };

    await Report.findByIdAndDelete(req.params.id);

    // Log the report deletion action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'REPORT',
        {
          description: `Deleted report: "${reportData.title}" (ID: ${reportData.id})`,
          reportId: reportData.id,
          reportTitle: reportData.title,
          reportType: reportData.reportType,
          reportStatus: reportData.status,
          reportPriority: reportData.priority
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete report',
      error: error.message
    });
  }
};

// Verify report (admin only)
const verifyReport = async (req, res) => {
  try {
    const { notes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.updateStatus('verified', req.user.id, notes);

    // Log the report verification action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'REPORT',
        {
          description: `Verified report: "${report.title}" (ID: ${report._id})`,
          reportId: report._id,
          reportTitle: report.title,
          reportType: report.reportType,
          previousStatus: 'pending',
          newStatus: 'verified',
          notes: notes
        },
        req
      );
    }

    // Send notification to reporter
    await Notification.create({
      recipient: report.reporter,
      title: 'Report Verified',
      message: `Your report "${report.title}" has been verified by an admin.`,
      type: 'report_verified',
      priority: 'medium',
      relatedEntity: {
        type: 'report',
        entityId: report._id
      },
      sender: {
        type: 'admin',
        id: req.user.id,
        name: 'Admin'
      },
      delivery: {
        channels: ['in_app', 'email']
      }
    });

    res.json({
      success: true,
      message: 'Report verified successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Verify report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify report',
      error: error.message
    });
  }
};

// Resolve report (admin only)
const resolveReport = async (req, res) => {
  try {
    const { notes, actions } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.updateStatus('resolved', req.user.id, notes);
    if (actions) {
      report.resolutionActions = actions;
      await report.save();
    }

    // Log the report resolution action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'REPORT',
        {
          description: `Resolved report: "${report.title}" (ID: ${report._id})`,
          reportId: report._id,
          reportTitle: report.title,
          reportType: report.reportType,
          previousStatus: 'verified',
          newStatus: 'resolved',
          notes: notes,
          resolutionActions: actions
        },
        req
      );
    }

    // Send notification to reporter
    await Notification.create({
      recipient: report.reporter,
      title: 'Report Resolved',
      message: `Your report "${report.title}" has been resolved.`,
      type: 'report_resolved',
      priority: 'medium',
      relatedEntity: {
        type: 'report',
        entityId: report._id
      },
      sender: {
        type: 'admin',
        id: req.user.id,
        name: 'Admin'
      },
      delivery: {
        channels: ['in_app', 'email']
      }
    });

    res.json({
      success: true,
      message: 'Report resolved successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve report',
      error: error.message
    });
  }
};

// Add comment to report
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await report.addComment(req.user.id, content);

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { report }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// Get reports by location
const getReportsByLocation = async (req, res) => {
  try {
    const { lat, lng, radius = 1000 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const reports = await Report.findByLocation(parseFloat(lat), parseFloat(lng), parseInt(radius));

    res.json({
      success: true,
      data: { reports }
    });
  } catch (error) {
    console.error('Get reports by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reports by location',
      error: error.message
    });
  }
};

// Get report statistics
const getReportStats = async (req, res) => {
  try {
    const stats = await Report.getReportStats();
    const reportsByType = await Report.getReportsByType();

    res.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalReports: 0,
          pendingReports: 0,
          verifiedReports: 0,
          resolvedReports: 0,
          avgResolutionTime: 0
        },
        byType: reportsByType
      }
    });
  } catch (error) {
    console.error('Get report stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get report statistics',
      error: error.message
    });
  }
};

// Archive report
const archiveReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.isArchived = true;
    report.archivedAt = new Date();
    report.archivedBy = req.user.id;
    await report.save();

    // Log the report archiving action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'REPORT',
        {
          description: `Archived report: "${report.title}" (ID: ${report._id})`,
          reportId: report._id,
          reportTitle: report.title,
          reportType: report.reportType,
          previousStatus: report.status,
          newStatus: 'archived'
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Report archived successfully'
    });
  } catch (error) {
    console.error('Archive report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to archive report',
      error: error.message
    });
  }
};

// Reverse geocoding endpoint for reports - Get address from coordinates
const reverseGeocodeReport = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return sendErrorResponse(res, 400, 'Latitude and longitude are required');
    }
    
    // Create a temporary report instance to use the method
    const tempReport = new Report({
      location: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        coordinates: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
      }
    });
    
    const address = await tempReport.reverseGeocode();
    
    sendSuccessResponse(res, {
      coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) },
      address: address,
      geocodedAddress: tempReport.geocodedAddress,
      geocodingStatus: tempReport.geocodingStatus
    }, 'Address retrieved successfully');
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    sendErrorResponse(res, 500, 'Failed to perform reverse geocoding', error);
  }
};

// Bulk reverse geocoding for multiple reports
const bulkReverseGeocodeReports = async (req, res) => {
  try {
    const { reportIds } = req.body;
    
    if (!reportIds || !Array.isArray(reportIds)) {
      return sendErrorResponse(res, 400, 'reportIds array is required');
    }
    
    const results = await Report.reverseGeocodeReports(reportIds);
    
    sendSuccessResponse(res, {
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }, 'Bulk reverse geocoding completed');
  } catch (error) {
    console.error('Bulk reverse geocoding error:', error);
    sendErrorResponse(res, 500, 'Failed to perform bulk reverse geocoding', error);
  }
};

// Auto-reverse geocode a specific report
const autoReverseGeocodeReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return sendErrorResponse(res, 404, 'Report not found');
    }
    
    const lat = report.location?.coordinates?.lat || report.location?.latitude;
    const lng = report.location?.coordinates?.lng || report.location?.longitude;
    
    if (!lat || !lng) {
      return sendErrorResponse(res, 400, 'Report does not have valid coordinates');
    }
    
    const address = await report.reverseGeocode();
    await report.save();
    
    // Log the reverse geocoding action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'REPORT',
        {
          description: `Auto-reverse geocoded report: "${report.description}" (ID: ${report._id})`,
          reportId: report._id,
          reportDescription: report.description,
          geocodedAddress: address,
          coordinates: {
            latitude: report.location?.latitude || report.location?.coordinates?.lat,
            longitude: report.location?.longitude || report.location?.coordinates?.lng
          }
        },
        req
      );
    }
    
    sendSuccessResponse(res, {
      report: {
        _id: report._id,
        geocodedAddress: report.geocodedAddress,
        address: report.address,
        geocodingStatus: report.geocodingStatus,
        geocodingError: report.geocodingError
      }
    }, 'Report reverse geocoded successfully');
  } catch (error) {
    console.error('Auto reverse geocoding error:', error);
    sendErrorResponse(res, 500, 'Failed to auto reverse geocode report', error);
  }
};

// Get total report count
const getTotalReportCount = async (req, res) => {
  try {
    const totalCount = await Report.countDocuments({});

    sendSuccessResponse(res, {
      totalCount
    }, 'Total report count retrieved successfully');
  } catch (error) {
    console.error('Get total report count error:', error);
    sendErrorResponse(res, 500, 'Failed to get total report count', error);
  }
};

// Get active report count (not archived)
const getActiveReportCount = async (req, res) => {
  try {
    const activeCount = await Report.countDocuments({
      $or: [
        { isArchived: { $ne: true } },
        { archived: { $ne: true } },
        { isArchived: { $exists: false } },
        { archived: { $exists: false } }
      ]
    });

    sendSuccessResponse(res, {
      activeCount
    }, 'Active report count retrieved successfully');
  } catch (error) {
    console.error('Get active report count error:', error);
    sendErrorResponse(res, 500, 'Failed to get active report count', error);
  }
};

// Get archived report count
const getArchivedReportCount = async (req, res) => {
  try {
    const archivedCount = await Report.countDocuments({
      $or: [
        { isArchived: true },
        { archived: true }
      ]
    });

    sendSuccessResponse(res, {
      archivedCount
    }, 'Archived report count retrieved successfully');
  } catch (error) {
    console.error('Get archived report count error:', error);
    sendErrorResponse(res, 500, 'Failed to get archived report count', error);
  }
};

// Get all active reports (not archived)
const getActiveReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      city,
      barangay,
      dateFrom,
      dateTo,
      search
    } = req.query;

    // Build filter object - only active (not archived) reports
    const filter = {
      $and: [
        {
          $or: [
            { isArchived: { $ne: true } },
            { archived: { $ne: true } },
            { isArchived: { $exists: false } },
            { archived: { $exists: false } }
          ]
        }
      ]
    };

    if (status) filter.status = status;
    if (type) filter.reportType = type;
    if (priority) filter.priority = priority;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (barangay) filter['location.barangay'] = new RegExp(barangay, 'i');
    
    if (dateFrom || dateTo) {
      const dateFilter = {
        $or: []
      };
      if (dateFrom && dateTo) {
        dateFilter.$or.push(
          { reportedAt: { $gte: new Date(dateFrom), $lte: new Date(dateTo) } },
          { timestamp: { $gte: new Date(dateFrom), $lte: new Date(dateTo) } }
        );
      } else if (dateFrom) {
        dateFilter.$or.push(
          { reportedAt: { $gte: new Date(dateFrom) } },
          { timestamp: { $gte: new Date(dateFrom) } }
        );
      } else if (dateTo) {
        dateFilter.$or.push(
          { reportedAt: { $lte: new Date(dateTo) } },
          { timestamp: { $lte: new Date(dateTo) } }
        );
      }
      filter.$and.push(dateFilter);
    }
    
    if (search) {
      const searchFilter = {
        $or: [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { 'location.address': new RegExp(search, 'i') },
          { address: new RegExp(search, 'i') }
        ]
      };
      filter.$and.push(searchFilter);
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'firstName lastName email')
      .populate('userId', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ reportedAt: -1, timestamp: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(filter);

    sendSuccessResponse(res, {
      reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    }, 'Active reports retrieved successfully');
  } catch (error) {
    console.error('Get active reports error:', error);
    sendErrorResponse(res, 500, 'Failed to get active reports', error);
  }
};

module.exports = {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport,
  verifyReport,
  resolveReport,
  addComment,
  getReportsByLocation,
  getReportStats,
  archiveReport,
  reverseGeocodeReport,
  bulkReverseGeocodeReports,
  autoReverseGeocodeReport,
  getTotalReportCount,
  getActiveReportCount,
  getArchivedReportCount,
  getActiveReports
};
