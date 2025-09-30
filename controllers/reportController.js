// controllers/reportController.js
const Report = require("../models/Reports.js");

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
    if (updates.description && updates.description.length > 500) {
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



exports.createReport = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const { reportType, location, userId, description, address, verified } = req.body;

    // basic required fields
    if (
      !reportType ||
      !location ||
      !location.latitude ||
      !location.longitude ||
      !description ||
      !address ||
      !verified
    ) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    // check description length limit
    if (description.length > 500) {
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
    const reports = await Report.find().sort({ timestamp: -1 });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
