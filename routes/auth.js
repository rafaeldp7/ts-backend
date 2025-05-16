const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");


// Utils (replace with actual email sender)
const sendVerificationEmail = (email, token) => {
  console.log(`Verification email sent to ${email}: http://localhost:3000/verify/${token}`);
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, city, province, barangay, street } = req.body;

    if (!name || !email || !password || !city || !province || !barangay || !street) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const verificationToken = crypto.randomBytes(20).toString("hex");

    const newUser = await User.create({
      name,
      email,
      password,
      city,
      province,
      barangay,
      street,
      verificationToken,
    });

    sendVerificationEmail(email, verificationToken);

    res.status(201).json({ msg: "Registered successfully. Please check your email to verify." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Verify email
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ msg: "Please verify your email first" });
    }

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role, id: user.id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// PROFILE (Protected)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// Status
router.get("/", (req, res) => {
  res.json({ msg: "Auth API is working!" });
});

// All Users (For Admins Only - protect if needed)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// First Registered User Name
router.get("/first-user-name", async (req, res) => {
  try {
    const firstUser = await User.findOne({}, "name").sort({ _id: 1 });
    if (!firstUser) return res.status(404).json({ msg: "No users found" });
    res.json({ name: firstUser.name });
  } catch (err) {
    console.error("Error fetching first user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Monthly User Growth
router.get("/user-growth", async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear().toString().slice(-2);

    const monthlyData = new Array(12).fill(0);
    for (let month = 0; month < 12; month++) {
      const MM = (month + 1).toString().padStart(2, "0");
      const YYMM = `${currentYear}${MM}`;
      const count = await User.countDocuments({ id: new RegExp(`^${YYMM}`) });
      monthlyData[month] = count;
    }

    res.json({ monthlyData });
  } catch (error) {
    console.error("Error fetching user growth:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Total User Count
router.get("/user-count", async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// New Users This Month
router.get("/new-users-this-month", async (req, res) => {
  try {
    const now = new Date();
    const YYMM = now.toISOString().slice(2, 7).replace("-", "");
    const newUsers = await User.find({ id: new RegExp(`^${YYMM}`) });
    res.json({ count: newUsers.length, users: newUsers });
  } catch (error) {
    console.error("Error fetching new users this month:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete Account (Protected)
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error("Account Deletion Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
