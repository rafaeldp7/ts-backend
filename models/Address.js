const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  province: { type: String, required: true },
  barangay: { type: String, required: true },
  street: { type: String, required: true },
});

module.exports = mongoose.model("Address", UserSchema);
