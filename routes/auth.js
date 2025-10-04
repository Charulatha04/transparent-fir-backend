// routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // <-- Import the JWT tool

// This is our endpoint for sending an OTP
router.post('/send-otp', async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpires = new Date(new Date().getTime() + 5 * 60 * 1000);

  try {
    let user = await User.findOneAndUpdate(
      { phoneNumber: phoneNumber },
      { otp: otp, otpExpires: otpExpires },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log(`Generated OTP ${otp} for ${phoneNumber}`);
    res.status(200).json({ 
      message: `OTP sent successfully to ${phoneNumber}`,
      otp: otp
    });
  } catch (error) {
    console.error("Error saving user with OTP", error);
    res.status(500).json({ message: "Error processing your request" });
  }
});

// Endpoint for verifying the OTP
router.post('/verify-otp', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ phoneNumber: phoneNumber });

    if (!user) {
      return res.status(400).json({ message: "User not found." });
    }

    if (user.otp !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    
    // ## NEW LOGIC: CREATE AND SEND A JWT TOKEN ##
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ message: "User verified successfully!", token }); // <-- Send token back
      }
    );

  } catch (error) {
    console.error("Error verifying OTP", error);
    res.status(500).json({ message: "Error processing your request" });
  }
});

module.exports = router;