// routes/reports.js

const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const multer = require('multer');
const cloudinary = require('../config/cloudinaryConfig');
const streamifier = require('streamifier');
const citizenAuthMiddleware = require('../middleware/citizenAuthMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/reports - Create a new report
router.post('/', citizenAuthMiddleware, async (req, res) => {
  try {
    const { caseType, description, location, isPublic, hashtags } = req.body;
    const newReport = new Report({
      citizenId: req.user.id, // Get citizenId from the logged-in user's token
      caseType,
      description,
      location,
      isPublic,
      hashtags
    });
    await newReport.save();
    res.status(201).json({ message: "Report filed successfully", report: newReport });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Server error while creating report" });
  }
});

// GET /api/reports - Get all public reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find({ isPublic: true }).sort({ createdAt: -1 });
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Server error while fetching reports" });
  }
});

// ## NEW ENDPOINT TO GET LOGGED-IN USER'S REPORTS ##
// GET /api/reports/my-reports
router.get('/my-reports', citizenAuthMiddleware, async (req, res) => {
  try {
    // Find reports where the citizenId matches the logged-in user's ID
    const myReports = await Report.find({ citizenId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(myReports);
  } catch (error) {
    console.error("Error fetching user's reports:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/reports/:id - Get a single report by its ID
router.get('/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (error) {
    console.error("Error fetching single report:", error);
    res.status(500).json({ message: "Server error while fetching report" });
  }
});

// POST /api/reports/:id/evidence - Upload evidence for a report
router.post('/:id/evidence', citizenAuthMiddleware, upload.single('evidence'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  let uploadStream = cloudinary.uploader.upload_stream({ folder: "fir_evidence" }, async (error, result) => {
    if (error) { return res.status(500).json({ message: "Error uploading to Cloudinary" }); }
    try {
      const report = await Report.findByIdAndUpdate(req.params.id, { evidenceUrl: result.secure_url }, { new: true });
      if (!report) { return res.status(404).json({ message: "Report not found" }); }
      res.status(200).json(report);
    } catch (dbError) { res.status(500).json({ message: "Error updating report in database" }); }
  });
  streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
});

// PUT /api/reports/:id/upvote - Upvote a report
router.put('/:id/upvote', citizenAuthMiddleware, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) { return res.status(404).json({ message: 'Report not found' }); }
    if (report.upvotes.includes(req.user.id)) {
      return res.status(400).json({ message: 'You have already upvoted this report' });
    }
    report.upvotes.push(req.user.id);
    await report.save();
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;