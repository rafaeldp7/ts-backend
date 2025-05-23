const Trip = require("../models/TripModel");

// ================= USER SIDE =================

// Get all trips for a specific user
exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .populate("motorId") // show motor info like nickname, plateNumber
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch trips", error: err.message });
  }
};

// Add a new trip
exports.addTrip = async (req, res) => {
  try {
    const { userId, motorId, distance, fuelUsed, timeArrived, eta, destination } = req.body;

    const newTrip = new Trip({
      userId,
      motorId,
      distance,
      fuelUsed,
      timeArrived,
      eta,
      destination,
    });

    await newTrip.save();

    res.status(201).json({ msg: "Trip recorded", trip: newTrip });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add trip", error: err.message });
  }
};

// ================= ADMIN SIDE =================

// Get all trips (admin)
exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("userId")
      .populate("motorId")
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch all trips", error: err.message });
  }
};

// Delete a trip (hard delete)
exports.deleteTrip = async (req, res) => {
  try {
    const deleted = await Trip.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Trip not found" });

    res.status(200).json({ msg: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete trip", error: err.message });
  }
};

// Get all trips by a specific user (admin)
exports.getTripsByUser = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .populate("userId")
      .populate("motorId")
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch trips for user", error: err.message });
  }
};

// Get trips within a date range
exports.getTripsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const trips = await Trip.find({
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .populate("userId")
      .populate("motorId");

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to filter trips by date", error: err.message });
  }
};

// Get paginated trips
exports.getPaginatedTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const trips = await Trip.find()
      .populate("userId")
      .populate("motorId")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Trip.countDocuments();

    res.status(200).json({
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      trips,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch paginated trips", error: err.message });
  }
};

// GET total trip count
exports.getTripCount = async (req, res) => {
  try {
    const count = await Trip.countDocuments();
    res.status(200).json({ totalTrips: count });
  } catch (err) {
    res.status(500).json({ msg: "Failed to count trips", error: err.message });
  }
};

