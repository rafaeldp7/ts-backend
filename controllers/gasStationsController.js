const GasStation = require("../models/GasStation");
const PriceHistory = require("../models/PriceHistory");

// USER: Get Nearby Stations
exports.getNearbyStations = async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ msg: "Missing coordinates" });

  try {
    const stations = await GasStation.find({
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000,
        },
      },
    });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ msg: "Nearby fetch failed", error: err.message });
  }
};

// ADMIN: Get All Stations
exports.getAllStations = async (req, res) => {
  try {
    const stations = await GasStation.find().sort({ updatedAt: -1 });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed", error: err.message });
  }
};

// ADMIN: Get Single Station
exports.getStationById = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);
    if (!station) return res.status(404).json({ msg: "Not found" });
    res.json(station);
  } catch (err) {
    res.status(500).json({ msg: "Fetch failed", error: err.message });
  }
};

// ADMIN: Create New Station
exports.createStation = async (req, res) => {
  try {
    const station = new GasStation(req.body);
    await station.save();
    res.status(201).json({ msg: "Created", station });
  } catch (err) {
    res.status(400).json({ msg: "Create failed", error: err.message });
  }
};

// ADMIN: Update Station + Save Price History
exports.adminUpdateStation = async (req, res) => {
  try {
    const station = await GasStation.findById(req.params.id);
    if (!station) return res.status(404).json({ msg: "Not found" });

    const { fuelPrices, servicesOffered, openHours, brand } = req.body;

    if (fuelPrices) {
      await PriceHistory.create({
        stationId: station._id,
        updatedBy: req.user._id,
        prices: fuelPrices,
        source: "admin",
      });

      station.fuelPrices = fuelPrices;
      station.priceSource = "admin";
      station.updatedBy = req.user._id;
    }

    if (servicesOffered) station.servicesOffered = servicesOffered;
    if (openHours) station.openHours = openHours;
    if (brand) station.brand = brand;

    station.lastUpdated = Date.now();
    await station.save();

    res.json({ msg: "Updated", station });
  } catch (err) {
    res.status(500).json({ msg: "Update failed", error: err.message });
  }
};

// ADMIN: Delete Station
exports.deleteStation = async (req, res) => {
  try {
    const deleted = await GasStation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Not found" });
    res.json({ msg: "Deleted", deleted });
  } catch (err) {
    res.status(500).json({ msg: "Delete failed", error: err.message });
  }
};

// ADMIN: Basic Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const total = await GasStation.countDocuments();
    const brands = await GasStation.aggregate([
      { $group: { _id: "$brand", count: { $sum: 1 } } },
    ]);
    const avgPrices = await GasStation.aggregate([
      {
        $group: {
          _id: null,
          avgGasoline: { $avg: "$fuelPrices.gasoline" },
          avgDiesel: { $avg: "$fuelPrices.diesel" },
        },
      },
    ]);

    res.json({ total, brands, avgPrices: avgPrices[0] || {} });
  } catch (err) {
    res.status(500).json({ msg: "Analytics failed", error: err.message });
  }
};
