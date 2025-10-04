// models/Report.js

const mongoose = require('mongoose');

const policeUpdateSchema = new mongoose.Schema({
  text: { type: String, required: true },
  officerName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const reportSchema = new mongoose.Schema({
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  caseType: {
    type: String,
    required: true,
    enum: ['Missing Person', 'Theft / Crime', 'Riot / Protest'],
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    latitude: { type: String },
    longitude: { type: String },
  },
  evidenceUrl: {
    type: String,
    required: false,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: 'Submitted',
  },
  policeUpdates: [policeUpdateSchema],
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // ## NEW FIELD ADDED HERE ##
  hashtags: [String] // An array to hold hashtag strings

}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;