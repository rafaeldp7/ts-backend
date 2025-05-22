const SavedDestination = require("../models/SavedDestination");

exports.getUserDestinations = async (req, res) => {
  try {
    const destinations = await SavedDestination.find({ userId: req.params.userId });
    res.status(200).json(destinations);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch destinations", error: err.message });
  }
};

exports.addDestination = async (req, res) => {
  try {
    const { userId, label, location } = req.body;

    if (!userId || !label || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newDest = new SavedDestination({ userId, label, location });
    await newDest.save();
    res.status(201).json({ msg: "Destination saved", destination: newDest });
  } catch (err) {
    res.status(500).json({ msg: "Failed to save destination", error: err.message });
  }
};

exports.deleteDestination = async (req, res) => {
  try {
    await SavedDestination.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Destination deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete", error: err.message });
  }
};
