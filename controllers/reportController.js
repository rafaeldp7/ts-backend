// controllers/reportController.js
const Report = require("../models/Reports.js");

exports.createReport = async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const { reportType, location, userId, description } = req.body;

    // Validation
    if (
      !reportType ||
      !location ||
      !location.latitude ||
      !location.longitude ||
      !description ||
      description.length > 20
    ) {
      return res.status(400).json({ message: "Missing or invalid fields" });
    }

    // Create new report
    const newReport = new Report({
      userId: userId || null,
      reportType,
      description,
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
