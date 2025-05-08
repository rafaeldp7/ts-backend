const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  id: { type: String, unique: true }, // Auto-generated ID
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ }, // Regex for email validation
  password: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String, required: true },
});

// Hash the password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Middleware to auto-generate `id` before saving
UserSchema.pre("save", async function (next) {
  if (!this.id) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, "0"); // 01-12
    const day = String(now.getDate()).padStart(2, "0"); // 01-31

    // Count existing users for today
    const count = await this.constructor.countDocuments({
      id: new RegExp(`^${year}${month}${day}`),
    });

    // Generate ID: YYMMDD0001, YYMMDD0002, etc.
    this.id = `${year}${month}${day}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
