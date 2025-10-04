// config/cloudinaryConfig.js

const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// This function connects our app to our Cloudinary account
// using the secret keys we stored in the .env file.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;