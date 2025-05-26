const GasStation = require("../models/GasStation");

// 📍 USER: Get Nearby Gas Stations
exports.getNearbyStations = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ msg: "Latitude and longitude required" });
  }

  try {
    const stations = await GasStation.find({
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: 5000,
        },
      },
    });

    res.json(stations);
  } catch (err) {
    res.status(500).json({ msg: "Nearby fetch failed", error: err.message });
  }
};

// 👨‍💼 ADMIN: Get All Gas Stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await GasStation.find().sort({ updatedAt: -1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed", error: err.message });
  }
};

// 👨‍💼 ADMIN: Get Single Station by ID
exports.getStationById = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);
    if (!station) return res.status(404).json({ msg: "Station not found" });
    res.json(station);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch", error: err.message });
  }
};

// 👨‍💼 ADMIN: Create New Station
exports.createStation = async (req, res) => {
  try {
    const newStation = new GasStation(req.body);
    await newStation.save();
    res.status(201).json({ msg: "Created", gasStation: newStation });
  } catch (err) {
    res.status(400).json({ msg: "Creation failed", error: err.message });
  }
};

// 👨‍💼 ADMIN: Update Station
exports.updateStation = async (req, res) => {
  try {
    const updated = await GasStation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ msg: "Station not found" });
    res.json({ msg: "Updated", updated });
  } catch (err) {
    res.status(400).json({ msg: "Update failed", error: err.message });
  }
};

// 👨‍💼 ADMIN: Delete Station
exports.deleteStation = async (req, res) => {
  try {
    const deleted = await GasStation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Station not found" });
    res.json({ msg: "Deleted", deleted });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed", error: err.message });
  }
};

// 📊 ADMIN: View Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const totalStations = await GasStation.countDocuments();
    const brands = await GasStation.aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);
    const avgFuelPrices = await GasStation.aggregate([
      {
        $group: {
          _id: null,
          avgGasoline: { $avg: "$fuelPrices.gasoline" },
          avgDiesel: { $avg: "$fuelPrices.diesel" },
        },
      },
    ]);

    res.json({
      totalStations,
      brands,
      avgFuelPrices: avgFuelPrices[0] || {},
    });
  } catch (err) {
    res.status(500).json({ msg: "Analytics error", error: err.message });
  }
};
