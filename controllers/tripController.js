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

// GET /api/trips/analytics
exports.getTripAnalytics = async (req, res) => {
  try {
    const trips = await Trip.find();

    const totalDistance = trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0);
    const totalTime = trips.reduce((sum, t) => sum + parseFloat(t.timeArrived || 0), 0);
    const totalFuel = trips.reduce((sum, t) => sum + parseFloat(t.fuelUsed || 0), 0);

    res.status(200).json({
      totalTrips: trips.length,
      totalDistance,
      totalTime,
      totalFuel,
      totalExpense: totalFuel * 100, // assuming ₱100/L
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute analytics", error: err.message });
  }
};

// GET /api/trips/summary/month
exports.getMonthlyTripSummary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const trips = await Trip.find({ createdAt: { $gte: start, $lte: end } });

    const monthlyDistance = trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0);
    const monthlyFuel = trips.reduce((sum, t) => sum + parseFloat(t.fuelUsed || 0), 0);
    const monthlyTime = trips.reduce((sum, t) => sum + parseFloat(t.timeArrived || 0), 0);

    res.status(200).json({
      tripsThisMonth: trips.length,
      monthlyDistance,
      monthlyFuel,
      monthlyTime,
      monthlyExpense: monthlyFuel * 100,
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch monthly summary", error: err.message });
  }
};

// GET /api/trips/leaderboard
exports.getTopUsersByTripCount = async (req, res) => {
  try {
    const results = await Trip.aggregate([
      { $group: { _id: "$userId", tripCount: { $sum: 1 } } },
      { $sort: { tripCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute top users", error: err.message });
  }
};

// GET /api/trips/motors/most-used
exports.getMostUsedMotors = async (req, res) => {
  try {
    const results = await Trip.aggregate([
      { $group: { _id: "$motorId", usageCount: { $sum: 1 } } },
      { $sort: { usageCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch top motors", error: err.message });
  }
};

// GET /api/trips/date-range?startDate=2024-01-01&endDate=2024-12-31
exports.getTripsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const trips = await Trip.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to filter trips by date", error: err.message });
  }
};
