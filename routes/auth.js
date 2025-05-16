const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware"); // Import middleware


const router = express.Router();

// REGISTER USER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, city, province, barangay, street } = req.body;

    if (!name || !email || !password || !city || !province || !barangay || !street) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword, city, province, barangay, street });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      province: user.province,
      barangay: user.barangay,
      street: user.street,
    };

    res.status(201).json({ token, user: safeUser });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ msg: "Server error" });
  }
});

// LOGIN USER
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      province: user.province,
      barangay: user.barangay,
      street: user.street,
    };

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


// Protected Route: Get user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});
router.get("/", (req, res) => {
  res.json({ msg: "Auth API is working!" });
});


router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude passwords for security
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/first-user-name", async (req, res) => {
  try {
    const firstUser = await User.findOne({}, "name").sort({ _id: 1 }); // Sort by _id to get the first registered user

    if (!firstUser) {
      return res.status(404).json({ msg: "No users found" });
    }
    
    res.json({ name: firstUser.name });
  } catch (err) {
    console.error("Error fetching first user:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/user-growth", async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear().toString().slice(-2); // Get YY (last 2 digits of the year)
    
    const monthlyData = new Array(12).fill(0); // Ensure fixed 12 months, default to 0

    // Loop through all 12 months to count users
    for (let month = 0; month < 12; month++) { // Use 0-based index for array
      const MM = (month + 1).toString().padStart(2, "0"); // Convert 1 -> 01, 2 -> 02, etc.
      const YYMM = `${currentYear}${MM}`; // Format YYMM
      
      // Count users where ID starts with YYMM
      const count = await User.countDocuments({ id: new RegExp(`^${YYMM}`) });

      monthlyData[month] = count; // Assign correctly to array index
    }

    res.json({ monthlyData });
  } catch (error) {
    console.error("Error fetching user growth:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




router.get("/user-count", async (req, res) => {
  try {
    const count = await User.countDocuments(); // Bilang ng users
    res.json({ count });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get new users this month
router.get("/new-users-this-month", async (req, res) => {
  try {
    const now = new Date();
    const YYMM = now.toISOString().slice(2, 7).replace("-", ""); // Kunin ang YYMM format (e.g., "2503" for March 2025)

    // Hanapin ang mga user na may ID na nagsisimula sa YYMM
    const newUsers = await User.find({ id: new RegExp(`^${YYMM}`) });

    res.json({ count: newUsers.length, users: newUsers });
  } catch (error) {
    console.error("Error fetching new users this month:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// DELETE USER ACCOUNT
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error("Account Deletion Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});



module.exports = router;
