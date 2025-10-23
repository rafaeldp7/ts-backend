const Trip = require('../models/TripModel');

exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const trips = await Trip.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$userId",
          totalDistance: { $sum: "$distance" },
          tripCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalDistance: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.status(200).json({ leaderboard: trips });
  } catch (err) {
    res.status(500).json({ msg: "Failed to generate leaderboard", error: err.message });
  }
};
