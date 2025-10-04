// index.js

const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const policeRoutes = require('./routes/police'); // <-- NEW LINE

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB.", err);
  });


// Use the routes
app.get('/', (req, res) => {
  res.json({ message: "Welcome to the TransparentSmart FIR+ API!" });
});

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/police', policeRoutes); // <-- NEW LINE


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running successfully on http://localhost:${PORT}`);
});