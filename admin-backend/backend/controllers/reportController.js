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

    // Build filter object
    const filter = { isArchived: false };

    if (status) filter.status = status;
    if (type) filter.reportType = type;
    if (priority) filter.priority = priority;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (barangay) filter['location.barangay'] = new RegExp(barangay, 'i');
    if (dateFrom || dateTo) {
      filter.reportedAt = {};
      if (dateFrom) filter.reportedAt.$gte = new Date(dateFrom);
      if (dateTo) filter.reportedAt.$lte = new Date(dateTo);
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.address': new RegExp(search, 'i') }
      ];
    }

    const reports = await Report.find(filter)
      .populate('reporter', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .sort({ reportedAt: -1 })
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
    if (report.reporter.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this report'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        report[key] = req.body[key];
      }
    });

    await report.save();

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
    if (report.reporter.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this report'
      });
    }

    await Report.findByIdAndDelete(req.params.id);

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
        longitude: parseFloat(lng)
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
    
    if (!report.location.latitude || !report.location.longitude) {
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
            latitude: report.location.latitude,
            longitude: report.location.longitude
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
  autoReverseGeocodeReport
};
