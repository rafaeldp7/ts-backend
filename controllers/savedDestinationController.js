const SavedDestination = require('../models/SavedDestinationModel');

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
    const { userId, label, location, category } = req.body;

    if (!userId || !label || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    const newDest = new SavedDestination({
      userId,
      label,
      location,
      category: category || "Other", // ← make sure category is passed
    });

    await newDest.save();
    res.status(201).json({ msg: "Destination saved", destination: newDest });
  } catch (err) {
    res.status(500).json({ msg: "Failed to save destination", error: err.message });
  }
};

exports.updateDestination = async (req, res) => {
  try {
    const { label, location, category } = req.body;
    const updateData = {};

    if (label) updateData.label = label;
    if (location?.latitude && location?.longitude) updateData.location = location;
    if (category) updateData.category = category;

    const updated = await SavedDestination.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ msg: "Destination not found" });

    res.status(200).json({ msg: "Destination updated", destination: updated });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update", error: err.message });
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
