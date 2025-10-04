// models/PoliceUser.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const policeUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  badgeNumber: {
    type: String,
    required: true,
    unique: true, // Each officer must have a unique badge number
  },
  password: {
    type: String,
    required: true,
  }
});

// This is a special function that runs BEFORE a new user is saved
// It automatically encrypts the password.
policeUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const PoliceUser = mongoose.model('PoliceUser', policeUserSchema);

module.exports = PoliceUser;