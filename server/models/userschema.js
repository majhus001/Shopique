const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    mobile: { type: String, default: "", required: false },
    address: { type: String, default: "", required: false },
    pincode: { type: Number, default: null, required: false },
    image: { type: String, default: "" },
    lastLogin: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const User = mongoose.model("users", UserSchema);

module.exports = User;
