// controllers/reportController.js
const Report = require("../models/Reports.js");

exports.createReport = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const { reportType, location, userId, description, address, verified } = req.body;

if (
  !reportType ||
  !location ||
  !location.latitude ||
  !location.longitude ||
  !description ||
  description.length > 20 ||
  !address ||
  !verified
) {
  return res.status(400).json({ message: "Missing or invalid fields" });
}

const newReport = new Report({
  userId: userId || null,
  reportType,
  description,
  address: address || "No address provided",
  verified: verified || { verifiedByAdmin: 0, verifiedByUser: 0 },
  location
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
