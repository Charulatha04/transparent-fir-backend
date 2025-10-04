// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
phoneNumber: {
    type: String,
    required: true,
    unique: true, // Each phone number must be unique
},
otp: {
    type: String,
    required: false, // OTP is not always present
},
otpExpires: {
    type: Date,
    required: false, // Expiration time for the OTP
}
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

module.exports = User;