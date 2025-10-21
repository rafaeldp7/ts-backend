const GeneralAnalytics = require('../models/GeneralAnalytics');

// ✅ Create or Overwrite Analytics by Key
exports.createOrUpdateAnalytics = async (req, res) => {
  try {
    const { key, data, description } = req.body;
    const updatedBy = req.user?._id || null; // assumes token middleware

    const updated = await GeneralAnalytics.findOneAndUpdate(
      { key },
      { data, description, updatedBy },
      { upsert: true, new: true }
    );

    res.status(200).json({ msg: "Analytics saved", analytics: updated });
  } catch (err) {
    res.status(500).json({ msg: "Failed to save analytics", error: err.message });
  }
};

// ✅ Get All Analytics (Admin view)
exports.getAllAnalytics = async (req, res) => {
  try {
    const entries = await GeneralAnalytics.find().sort({ updatedAt: -1 });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch analytics", error: err.message });
  }
};

// ✅ Get Analytics by Key (App or Admin use)
exports.getAnalyticsByKey = async (req, res) => {
  try {
    const entry = await GeneralAnalytics.findOne({ key: req.params.key });
    if (!entry) return res.status(404).json({ msg: "Analytics not found." });
    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch analytics", error: err.message });
  }
};
