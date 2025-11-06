// controllers/reportController.js
const Report = require("../models/Reports.js");
const mongoose = require("mongoose");
const { filterReports, validateCoordinates } = require("../utils/mapProcessingUtils");

exports.getArchivedReports = async (req, res) => {
  try {
    const reports = await Report.find({ archived: true }).sort({ timestamp: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching archived reports", error: err.message });
  }
};

exports.archiveReport = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate the ID before using it
    if (!id || id === 'null' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: 'Invalid or missing report ID' });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { archived: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ msg: 'Report not found' });
    }

    res.status(200).json({ msg: 'Report archived', report });
  } catch (err) {
    res.status(500).json({
      msg: 'Error archiving report',
      error: err.message,
    });
  }
};
// ✅ Update an existing report
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params; // report ID
    const updates = { ...req.body };

    // Validate report existence
    const existingReport = await Report.findById(id);
    if (!existingReport) {
      return res.status(404).json({ msg: "Report not found" });
    }

    // Optional: validate description length
    if (updates.description && updates.description.length > 100) {
      return res.status(400).json({ msg: "Description too long" });
    }

    // Handle address safely
    if (
      updates.address === undefined || 
      updates.address === null || 
      (typeof updates.address === "string" && updates.address.trim() === "")
    ) {
      delete updates.address; // don’t overwrite with empty/undefined
    }

    // Prevent overwriting critical fields
    delete updates._id;
    delete updates.createdAt;
    delete updates.updatedAt;

    // Update
    const updatedReport = await Report.findByIdAndUpdate(id, updates, {
      new: true, // return updated doc
      runValidators: true, // apply schema validators
    });

    res.status(200).json(updatedReport);
  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({ msg: "Error updating report", error: err.message });
  }
};

exports.updateVerification = async (req, res) => {
    try {
      const { id } = req.params;
    const { verifiedByAdmin, verifiedByUser } = req.body; // Expect either or both

    // Find report
    const report = await Report.findById(id);
      if (!report) {
      return res.status(404).json({ msg: "Report not found" });
    }

    // Ensure `verified` exists
    if (!report.verified) {
      report.verified = { verifiedByAdmin: 0, verifiedByUser: 0 };
    }

    // Update only the verification fields that were passed
    if (typeof verifiedByAdmin === "number") {
      report.verified.verifiedByAdmin = verifiedByAdmin;
    }
    if (typeof verifiedByUser === "number") {
      report.verified.verifiedByUser = verifiedByUser;
    }

    await report.save();

    res.status(200).json({
      msg: "Verification updated successfully",
      verified: report.verified,
    });
  } catch (err) {
    console.error("Update verification error:", err);
    res.status(500).json({
      msg: "Error updating verification",
      error: err.message,
    });
  }
};


exports.voteReport = async (req, res) => {
    try {
      const { id } = req.params;
    const { userId, vote } = req.body; // vote = 1 or -1

    if (![1, -1].includes(vote)) {
      return res.status(400).json({ msg: "Vote must be 1 or -1" });
    }

      const report = await Report.findById(id);
    if (!report) return res.status(404).json({ msg: "Report not found" });

    const existingVote = report.votes.find(v => v.userId.toString() === userId);

    if (existingVote) {
      if (existingVote.vote === vote) {
        // same vote, remove it
        report.votes = report.votes.filter(v => v.userId.toString() !== userId);
      } else {
        // switch vote
        existingVote.vote = vote;
      }
    } else {
      // new vote
      report.votes.push({ userId, vote });
      }

      await report.save();

    // Optional: return totalVotes
    const totalVotes = report.votes.reduce((sum, v) => sum + v.vote, 0);

    res.status(200).json({ report, totalVotes });
  } catch (err) {
    console.error("Vote report error:", err);
    res.status(500).json({ msg: "Error voting report", error: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const { reportType, location, userId, description, address, verified } = req.body;

    // basic required fields
    if (
      !reportType ||
      // !location ||
      !location.latitude ||
      !location.longitude ||
      !description ||
      !address 
      // !verified
    ) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    // check description length limit
    if (description.length > 100) {
      return res.status(400).json({ message: "Description too long" });
    }

    const newReport = new Report({
      userId: userId || null,
      reportType,
      description,
      address: address || "No address provided",
      verified: verified || { verifiedByAdmin: 0, verifiedByUser: 0 },
      location,
    });

    const saved = await newReport.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Create report error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const { 
      includeArchived = false, 
      includeInvalid = false,
      filters,
      viewport
    } = req.query;
    
    // Build query
    const query = {};
    
    // Filter archived reports unless explicitly included
    if (includeArchived !== 'true' && includeArchived !== true) {
      query.archived = { $ne: true };
      // Note: status field may not exist in all reports, so we only filter if it exists
      // The filterReports utility will handle status filtering
    }
    
    // Parse filters if provided
    let reportFilters = null;
    if (filters) {
      try {
        reportFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
        
        // Apply type filters
        if (reportFilters.types && Array.isArray(reportFilters.types) && reportFilters.types.length > 0) {
          query.reportType = { $in: reportFilters.types };
        }
        
        // Apply status filters
        if (reportFilters.status && Array.isArray(reportFilters.status) && reportFilters.status.length > 0) {
          query.status = { $in: reportFilters.status };
        }
      } catch (e) {
        console.warn('Invalid filters format:', e);
      }
    }
    
    // Parse viewport if provided
    if (viewport) {
      try {
        const viewportBounds = typeof viewport === 'string' ? JSON.parse(viewport) : viewport;
        query['location.latitude'] = {
          $gte: viewportBounds.south,
          $lte: viewportBounds.north
        };
        query['location.longitude'] = {
          $gte: viewportBounds.west,
          $lte: viewportBounds.east
        };
      } catch (e) {
        console.warn('Invalid viewport format:', e);
      }
    }
    
    // Fetch reports
    const rawReports = await Report.find(query).sort({ timestamp: -1 }).lean();
    
    // Filter invalid reports unless explicitly included
    let reports = rawReports;
    if (includeInvalid !== 'true' && includeInvalid !== true) {
      reports = filterReports(rawReports);
    }
    
    res.status(200).json({
      success: true,
      data: reports,
      statistics: {
        total: rawReports.length,
        filtered: reports.length,
        removed: rawReports.length - reports.length
      }
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};


exports.getReportCount = async (req, res) => {
  try {
    const count = await Report.countDocuments();
    res.status(200).json({ totalReports: count });
  } catch (err) {
    res.status(500).json({ msg: "Failed to count reports", error: err.message });
  }
};

exports.getReportsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const reports = await Report.find({ reportType: type }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching reports by type", error: err.message });
  }
};

exports.getReportsByDateRange = async (req, res) => {
  const { startDate, endDate } = req.body;
  try {
    const reports = await Report.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Failed to get reports by date", error: err.message });
  }
};

exports.getReportsByUser = async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user's reports", error: err.message });
  }
};

exports.getAllReportLocations = async (req, res) => {
  try {
    const reports = await Report.find({}, { location: 1, reportType: 1, description: 1, createdAt: 1 });
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch report locations", error: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Report not found" });
    res.status(200).json({ msg: "Report deleted successfully", deleted });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting report", error: err.message });
  }
};

// ============ REVERSE GEOCODING METHODS ============

// Reverse geocode a single report
exports.reverseGeocodeReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

    if (!report.location.latitude || !report.location.longitude) {
      return res.status(400).json({ message: 'Report does not have valid coordinates' });
    }

    const address = await report.reverseGeocode();
    await report.save();

    res.json({
      success: true,
      reportId: report._id,
      geocodedAddress: address,
      geocodingStatus: report.geocodingStatus
    });
  } catch (error) {
    console.error('Reverse geocode report error:', error);
    res.status(500).json({ 
      message: 'Server error reverse geocoding report',
      error: error.message 
    });
  }
};

// Reverse geocode multiple reports
exports.reverseGeocodeReports = async (req, res) => {
  try {
    const { reportIds } = req.body;
    
    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return res.status(400).json({ message: 'Report IDs array is required' });
    }

    const results = await Report.reverseGeocodeReports(reportIds);
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

      res.json({
      success: true,
      message: `Reverse geocoding completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
      });
    } catch (error) {
    console.error('Reverse geocode reports error:', error);
    res.status(500).json({ 
      message: 'Server error reverse geocoding reports',
      error: error.message 
    });
  }
};

// Get reports that need reverse geocoding
exports.getReportsNeedingGeocoding = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const filter = {
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null },
      $or: [
        { geocodingStatus: 'pending' },
        { geocodingStatus: 'failed' },
        { geocodedAddress: { $exists: false } }
      ]
    };

      const reports = await Report.find(filter)
      .select('_id reportType description location geocodingStatus geocodingError timestamp')
      .sort({ timestamp: -1 })
        .limit(limit * 1)
      .skip((page - 1) * limit);

      const total = await Report.countDocuments(filter);

      res.json({
      success: true,
        reports,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
      });
    } catch (error) {
    console.error('Get reports needing geocoding error:', error);
    res.status(500).json({ message: 'Server error getting reports needing geocoding' });
  }
};

// Bulk reverse geocode all pending reports
exports.bulkReverseGeocode = async (req, res) => {
  try {
    const { limit = 50 } = req.body;

    // Find reports that need geocoding
    const reports = await Report.find({
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null },
      $or: [
        { geocodingStatus: 'pending' },
        { geocodingStatus: 'failed' },
        { geocodedAddress: { $exists: false } }
      ]
    }).limit(limit);

    if (reports.length === 0) {
      return res.json({
        success: true,
        message: 'No reports need reverse geocoding',
        results: []
      });
    }

    const reportIds = reports.map(r => r._id);
    const results = await Report.reverseGeocodeReports(reportIds);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

      res.json({
      success: true,
      message: `Bulk reverse geocoding completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
      });
    } catch (error) {
    console.error('Bulk reverse geocode error:', error);
    res.status(500).json({ 
      message: 'Server error bulk reverse geocoding',
      error: error.message 
    });
  }
};

// Get geocoding statistics
exports.getGeocodingStats = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: '$geocodingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await Report.countDocuments();
    const reportsWithCoordinates = await Report.countDocuments({
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null }
    });

    const statusCounts = {
      pending: 0,
      success: 0,
      failed: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
    });

      res.json({
      success: true,
      stats: {
        totalReports,
        reportsWithCoordinates,
        geocodingStatus: statusCounts,
        geocodingRate: reportsWithCoordinates > 0 ? 
          (statusCounts.success / reportsWithCoordinates * 100).toFixed(2) + '%' : '0%'
      }
      });
    } catch (error) {
    console.error('Get geocoding stats error:', error);
    res.status(500).json({ message: 'Server error getting geocoding statistics' });
  }
};