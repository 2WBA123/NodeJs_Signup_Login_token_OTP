const { bool, string } = require("joi");
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  otp:{type:Array,default:[]}
});

module.exports = mongoose.model("otp", otpSchema);