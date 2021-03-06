const { bool, string } = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, default: null },
  email: { type: String, unique: true },
  password: { type: String },
  token: { type: String },
  email_Verified: { type:Boolean, default: false },
});

module.exports = mongoose.model("user", userSchema);