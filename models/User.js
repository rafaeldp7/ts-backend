const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    barangay: { type: String, required: true },
    street: { type: String, required: true },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // verifyToken: {
    //   type: String,
    // },
  },
  {
    timestamps: true, // 👈 This adds createdAt and updatedAt automatically
  }
);


// Combined pre-save hook for ID generation + password hashing
UserSchema.pre("save", async function (next) {
  if (!this.id) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const count = await this.constructor.countDocuments({
      id: new RegExp(`^${year}${month}${day}`),
    });

    this.id = `${year}${month}${day}${String(count + 1).padStart(4, "0")}`;
  }

  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Method to compare password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
