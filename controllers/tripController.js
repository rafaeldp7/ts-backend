const Trip = require("../models/TripModel");

// ================= USER SIDE =================

exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .populate("userId")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch trips", error: err.message });
  }
};

exports.addTrip = async (req, res) => {
  try {
    const {
      userId,
      motorId,
      distance,
      fuelUsedMin,
      fuelUsedMax,
      timeArrived,
      eta,
      destination,
    } = req.body;

    const newTrip = new Trip({
      userId,
      motorId,
      distance,
      fuelUsedMin,
      fuelUsedMax,
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

exports.getAllTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("userId")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch all trips", error: err.message });
  }
};

exports.deleteTrip = async (req, res) => {
  try {
    const deleted = await Trip.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "Trip not found" });

    res.status(200).json({ msg: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete trip", error: err.message });
  }
};

exports.getTripsByUser = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId })
      .populate("userId")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch trips for user", error: err.message });
  }
};

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
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
        },
      });

    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to filter trips by date", error: err.message });
  }
};

exports.getPaginatedTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const trips = await Trip.find()
      .populate("userId")
      .populate({
        path: "motorId",
        populate: {
          path: "motorcycleId",
          model: "Motorcycle",
        },
      })
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

exports.getTripCount = async (req, res) => {
  try {
    const count = await Trip.countDocuments();
    res.status(200).json({ totalTrips: count });
  } catch (err) {
    res.status(500).json({ msg: "Failed to count trips", error: err.message });
  }
};

// ================= ANALYTICS =================

exports.getTripAnalytics = async (req, res) => {
  try {
    const trips = await Trip.find();

    const totalDistance = trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0);

    const totalFuel = trips.reduce((sum, t) => {
      const avg = ((t.fuelUsedMin || 0) + (t.fuelUsedMax || 0)) / 2;
      return sum + avg;
    }, 0);

    const totalTime = trips.reduce((sum, t) => sum + parseFloat(t.duration || 0), 0);

    res.status(200).json({
      totalTrips: trips.length,
      totalDistance,
      totalTime,
      totalFuel,
      totalExpense: totalFuel * 100, // Peso per liter
    });
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute analytics", error: err.message });
  }
};

exports.getMonthlyTripSummary = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const trips = await Trip.find({ createdAt: { $gte: start, $lte: end } });

    const monthlyDistance = trips.reduce((sum, t) => sum + parseFloat(t.distance || 0), 0);
    const monthlyFuel = trips.reduce((sum, t) => {
      const avg = ((t.fuelUsedMin || 0) + (t.fuelUsedMax || 0)) / 2;
      return sum + avg;
    }, 0);
    const monthlyTime = trips.reduce((sum, t) => sum + parseFloat(t.duration || 0), 0);

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

// ================= INSIGHTS =================

exports.getTopUsersByTripCount = async (req, res) => {
  try {
    const results = await Trip.aggregate([
      { $group: { _id: "$userId", tripCount: { $sum: 1 } } },
      { $sort: { tripCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to compute top users", error: err.message });
  }
};

exports.getMostUsedMotors = async (req, res) => {
  try {
    const results = await Trip.aggregate([
      { $group: { _id: "$motorId", usageCount: { $sum: 1 } } },
      { $sort: { usageCount: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch top motors", error: err.message });
  }
};
