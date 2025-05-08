const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware"); // Import middleware


const router = express.Router();

router.get("/active-user-location", async (req, res) => {
    try {
      // Hanapin ang pinaka-latest na session na active pa
      const activeSession = await GasSession.findOne({ isActive: true }) 
        .sort({ createdAt: -1 }) // Kunin ang pinakabago
        .select("latitude longitude");
  
      if (!activeSession) {
        return res.status(404).json({ message: "No active sessions" });
      }
  
      res.json({
        latitude: activeSession.latitude,
        longitude: activeSession.longitude,
      });
    } catch (error) {
      console.error("Error fetching active user location:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  










module.exports = router;
