const Trip = require("../models/Trip");

exports.getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch trips", error: err.message });
  }
};

exports.addTrip = async (req, res) => {
  try {
    const { userId, distance, fuelUsed, timeArrived, eta, destination } = req.body;

    const newTrip = new Trip({ userId, distance, fuelUsed, timeArrived, eta, destination });
    await newTrip.save();

    res.status(201).json({ msg: "Trip recorded", trip: newTrip });
  } catch (err) {
    res.status(500).json({ msg: "Failed to add trip", error: err.message });
  }
};
