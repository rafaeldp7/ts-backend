const Report = require('../models/Reports');
const User = require('../models/User');

class ReportController {
  // Get all reports with filtering and pagination
  async getReports(req, res) {
    try {
      const userId = req.user._id;
      const { 
        page = 1, 
        limit = 20, 
        type, 
        severity, 
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        lat,
        lng,
        radius = 10
      } = req.query;

      // Build filter object
      const filter = { userId };
      if (type) filter.type = type;
      if (severity) filter.severity = severity;
      if (status) filter.status = status;

      // Add location filter if coordinates provided
      if (lat && lng) {
        filter.location = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        };
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const reports = await Report.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'firstName lastName');

      const total = await Report.countDocuments(filter);

      res.json({
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ message: 'Server error getting reports' });
    }
  }

  // Get nearby reports
  async getNearbyReports(req, res) {
    try {
      const { lat, lng, radius = 5, limit = 20 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const reports = await Report.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(lng), parseFloat(lat)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        },
        status: { $ne: 'archived' },
        archived: { $ne: true }
      })
      .limit(parseInt(limit))
      .populate('userId', 'firstName lastName');

      res.json(reports);
    } catch (error) {
      console.error('Get nearby reports error:', error);
      res.status(500).json({ message: 'Server error getting nearby reports' });
    }
  }

  // Get single report
  async getReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const report = await Report.findOne({ _id: id, userId })
        .populate('userId', 'firstName lastName');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({ message: 'Server error getting report' });
    }
  }

  // Create new report
  async createReport(req, res) {
    try {
      const userId = req.user._id;
      const reportData = {
        ...req.body,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const report = new Report(reportData);
      await report.save();

      // Populate user data
      await report.populate('userId', 'firstName lastName');

      res.status(201).json(report);
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ message: 'Server error creating report' });
    }
  }

  // Update report
  async updateReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const updates = { ...req.body, updatedAt: new Date() };

      const report = await Report.findOneAndUpdate(
        { _id: id, userId },
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({ message: 'Server error updating report' });
    }
  }

  // Delete report
  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const report = await Report.findOneAndDelete({ _id: id, userId });
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ message: 'Server error deleting report' });
    }
  }

  // Vote on report
  async voteReport(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { voteType } = req.body; // 'upvote', 'downvote', 'remove'

      const report = await Report.findById(id);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      // Remove existing vote
      report.votes = report.votes.filter(vote => vote.userId.toString() !== userId);

      // Add new vote if not removing
      if (voteType !== 'remove') {
        report.votes.push({
          userId,
          voteType,
          timestamp: new Date()
        });
      }

      await report.save();

      res.json({
        message: 'Vote recorded successfully',
        votes: report.votes,
        voteCount: report.votes.length
      });
    } catch (error) {
      console.error('Vote report error:', error);
      res.status(500).json({ message: 'Server error voting on report' });
    }
  }

  // Get report votes
  async getReportVotes(req, res) {
    try {
      const { id } = req.params;

      const report = await Report.findById(id).select('votes');
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json({
        votes: report.votes,
        voteCount: report.votes.length
      });
    } catch (error) {
      console.error('Get report votes error:', error);
      res.status(500).json({ message: 'Server error getting report votes' });
    }
  }

  // Update report status
  async updateReportStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { status, archived } = req.body;

      const updateData = { updatedAt: new Date() };
      if (status) updateData.status = status;
      if (archived !== undefined) updateData.archived = archived;

      const report = await Report.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json(report);
    } catch (error) {
      console.error('Update report status error:', error);
      res.status(500).json({ message: 'Server error updating report status' });
    }
  }

  // Verify report (Admin only)
  async verifyReport(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user._id;
      const { verified, notes } = req.body;

      // Check if user is admin (you might want to add role checking here)
      // For now, we'll assume the middleware handles admin verification

      const updateData = {
        isVerified: verified,
        verifiedBy: verified ? adminId : null,
        verifiedAt: verified ? new Date() : null,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.verificationNotes = notes;
      }

      const report = await Report.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName')
       .populate('verifiedBy', 'firstName lastName');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json({
        message: verified ? 'Report verified successfully' : 'Report verification removed',
        report
      });
    } catch (error) {
      console.error('Verify report error:', error);
      res.status(500).json({ message: 'Server error verifying report' });
    }
  }

  // Get verified reports
  async getVerifiedReports(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        type, 
        severity,
        sortBy = 'verifiedAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = { isVerified: true };
      if (type) filter.type = type;
      if (severity) filter.severity = severity;

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const reports = await Report.find(filter)
        .sort(sortOptions)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('userId', 'firstName lastName')
        .populate('verifiedBy', 'firstName lastName');

      const total = await Report.countDocuments(filter);

      res.json({
        reports,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
    } catch (error) {
      console.error('Get verified reports error:', error);
      res.status(500).json({ message: 'Server error getting verified reports' });
    }
  }

  // Get report verification status
  async getReportVerification(req, res) {
    try {
      const { id } = req.params;

      const report = await Report.findById(id)
        .select('isVerified verifiedBy verifiedAt verificationNotes')
        .populate('verifiedBy', 'firstName lastName email');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.json({
        isVerified: report.isVerified,
        verifiedBy: report.verifiedBy,
        verifiedAt: report.verifiedAt,
        verificationNotes: report.verificationNotes
      });
    } catch (error) {
      console.error('Get report verification error:', error);
      res.status(500).json({ message: 'Server error getting report verification' });
    }
  }

  // Bulk verify reports (Admin only)
  async bulkVerifyReports(req, res) {
    try {
      const { reportIds, verified, notes } = req.body;
      const adminId = req.user._id;

      if (!Array.isArray(reportIds) || reportIds.length === 0) {
        return res.status(400).json({ message: 'Report IDs array is required' });
      }

      const updateData = {
        isVerified: verified,
        verifiedBy: verified ? adminId : null,
        verifiedAt: verified ? new Date() : null,
        updatedAt: new Date()
      };

      if (notes) {
        updateData.verificationNotes = notes;
      }

      const result = await Report.updateMany(
        { _id: { $in: reportIds } },
        { $set: updateData }
      );

      res.json({
        message: `Successfully ${verified ? 'verified' : 'unverified'} ${result.modifiedCount} reports`,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error('Bulk verify reports error:', error);
      res.status(500).json({ message: 'Server error bulk verifying reports' });
    }
  }
}

module.exports = new ReportController();
