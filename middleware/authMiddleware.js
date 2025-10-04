// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
require('dotenv').config();

// This is our "security guard" function
module.exports = function(req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if there is no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // 3. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Add the user payload to the request object
    next(); // If token is valid, pass the request to the next function
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};