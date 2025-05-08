const express = require("express");
const Trip = require("../models/trip");

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log("Incoming trip summary:", req.body); // Log incoming data
    const { distance, fuelUsed, timeArrived, eta, destination, userId } = req.body;

    if (!distance || !fuelUsed || !timeArrived || !eta || !destination || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newSession = new Trip({
      userId,
      distance,
      fuelUsed,
      timeArrived,
      eta,
      destination,
    });

    await newSession.save();
    res.status(201).json({ message: 'Trip summary saved successfully', session: newSession });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save trip summary' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const sessions = await Trip.find();
    res.status(200).json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trip summaries' });
  }
});
router.get('/gasConsumption', async (req, res) => {
  try {
    const sessions = await Trip.find(); // Kunin lahat ng trip data

    // I-total lahat ng fuelUsed
    const totalFuelUsed = sessions.reduce((total, session) => {
      return total + (session.fuelUsed || 0);
    }, 0);

    res.status(200).json({ totalFuelUsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to calculate total fuel used' });
  }
});



router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await Trip.find({ userId });
    res.status(200).json(sessions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trip summaries' });
  }
});
router.get("/", async (req, res) => {
  try {
    const count = await Trip.countDocuments(); // or use estimatedDocumentCount() if preferred
    res.json({ count });
  } catch (err) {
    console.error("Error fetching trip count:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;
