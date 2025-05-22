const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// Mock email function


const sendVerificationEmail = (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
  from: `"Traffic Slight" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Verify Your Traffic Slight Account",
html: `
  <h2>Your Traffic Slight OTP</h2>
  <p>Enter this code in the app to verify your email:</p>
  <h1 style="letter-spacing: 2px;">${token}</h1>
`


};

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Email sending failed:", err);
    } else {
      console.log("Verification email sent:", info.response);
    }
  });
};


// Check API status
exports.status = (req, res) => {
  res.send("Auth API is up and running");
};

// Register user
exports.register = async (req, res) => {
  try {
    const { name, email, password, city, province, barangay, street } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !city || !province || !barangay || !street) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    // Generate verification token
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();


    // Create new user instance
    const newUser = new User({
      name,
      email,
      password,
      city,
      province,
      barangay,
      street,
      verifyToken: verificationToken,
    });

    // Save user (runs pre-save hooks)
    await newUser.save();

    sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      msg: "Registered successfully. Please check your email to verify.",
      token: verificationToken,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ msg: "Server error", error: error.message, stack: error.stack });
    console.log("Response status:", response.status);
    console.log("Response data:", data);


  }
};

// Email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verifyToken: token });
    if (!user) return res.status(400).json({ msg: "Invalid or expired token" });

    user.isVerified = true;
    user.verifyToken = undefined;
    await user.save();

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error("Verify error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// Resend verification email
// Resend verification email
exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found." });

    if (user.isVerified) {
      return res.status(400).json({ msg: "Email already verified." });
    }

    const newToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyToken = newToken;
    await user.save();

    sendVerificationEmail(user.email, newToken);

    res.status(200).json({ msg: "Verification email resent successfully." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ msg: "Server error." });
  }
};



// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ msg: "Invalid credentials - user not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials - wrong password" });

    if (!user.isVerified) {
      return res.status(403).json({ msg: "Please verify your email before logging in." });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: {
        id:user.id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        province: user.province,
        barangay: user.barangay,
        street: user.street,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Get profile
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

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

// Get first user name
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

// Get user growth
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

// Get user count
exports.getUserCount = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching user count:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// Get new users this month
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

// Delete account
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


// Update user location
exports.userLocation = async (req, res) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ msg: "Latitude and longitude required." });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { location: { lat, lng } },
      { new: true }
    );

    if (!user) return res.status(404).json({ msg: "User not found." });

    res.json({ msg: "Location updated", location: user.location });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ msg: "Server error" });
  }
};


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. Request OTP
exports.requestReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetToken = otp;
    user.resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Traffic Slight - Password Reset OTP</h2>
        <p>Use the code below to reset your password:</p>
        <h1>${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    });

    res.json({ msg: "OTP sent to email." });
  } catch (error) {
    console.error("Request Reset Error:", error);
    res.status(500).json({ msg: "Server error." });
  }
};

// 2. Verify OTP
exports.verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email, resetToken: otp });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    res.json({ msg: "OTP verified." });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ msg: "Server error." });
  }
};

// 3. Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email, resetToken: otp });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ msg: "Password reset successful. You may now log in." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ msg: "Server error." });
  }
};

