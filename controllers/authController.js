
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const status = (req, res) => {
  res.send("Auth API is up and running");
};

module.exports = {
  register,
  verifyEmail,
  login,
  getProfile,
  getAllUsers,
  getFirstUserName,
  getUserGrowth,
  getUserCount,
  getNewUsersThisMonth,
  deleteAccount,
  status, // ✅ Add this line
};


const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

const sendVerificationEmail = (email, token) => {
  console.log(`Verification email sent to ${email}: http://localhost:3000/verify/${token}`);
};

exports.register = async (req, res) => {
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

    //sendVerificationEmail(email, verificationToken);

    res.status(201).json({ msg: "Registered successfully. Please check your email to verify." });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
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
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials - user not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials - wrong password" });

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role, id: user.id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getFirstUserName = async (req, res) => {
  try {
    const firstUser = await User.findOne({}, "name").sort({ _id: 1 });
    if (!firstUser) return res.status(404).json({ msg: "No users found" });
    res.json({ name: firstUser.name });
  } catch (err) {
    console.error("Error fetching first user:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUserGrowth = async (req, res) => {
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
};

exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getNewUsersThisMonth = async (req, res) => {
  try {
    const now = new Date();
    const YYMM = now.toISOString().slice(2, 7).replace("-", "");
    const newUsers = await User.find({ id: new RegExp(`^${YYMM}`) });
    res.json({ count: newUsers.length, users: newUsers });
  } catch (error) {
    console.error("Error fetching new users this month:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({ msg: "Account deleted successfully" });
  } catch (err) {
    console.error("Account Deletion Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
