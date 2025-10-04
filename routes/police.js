// routes/police.js

const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const PoliceUser = require('../models/PoliceUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware'); // <-- Import our security guard

// POST /api/police/login - This route is public, so no middleware
router.post('/login', async (req, res) => {
  const { badgeNumber, password } = req.body;
  try {
    const officer = await PoliceUser.findOne({ badgeNumber });
    if (!officer) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, officer.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const payload = { user: { id: officer.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error("Police login error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


// GET /api/police/reports - This is now a protected route
router.get('/reports', authMiddleware, async (req, res) => {
  try {
    const allReports = await Report.find({}).sort({ createdAt: -1 });
    res.status(200).json(allReports);
  } catch (error) {
    console.error("Error fetching all reports for police:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/police/reports/:id/status - This is now a protected route
router.patch('/reports/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const reportId = req.params.id;
    const updatedReport = await Report.findByIdAndUpdate(
      reportId, { status: status }, { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(updatedReport);
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/police/reports/:id/updates - This is now a protected route
router.post('/reports/:id/updates', authMiddleware, async (req, res) => {
  try {
    const { text, officerName } = req.body;
    const reportId = req.params.id;
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    const newUpdate = { text: text, officerName: officerName };
    report.policeUpdates.unshift(newUpdate);
    await report.save();
    res.status(200).json(report);
  } catch (error) {
    console.error("Error adding police update:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// We are keeping this temporary route for now, but it's not protected
router.get('/seed-admin', async (req, res) => {
  try {
    const existingAdmin = await PoliceUser.findOne({ badgeNumber: '001' });
    if (existingAdmin) {
      return res.status(400).send('Admin user already exists.');
    }
    const newOfficer = new PoliceUser({
      fullName: 'Admin Officer',
      badgeNumber: '001',
      password: 'Password123'
    });
    await newOfficer.save();
    res.status(201).send('Admin user created! You can now test the login.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating admin user.');
  }
});


module.exports = router;