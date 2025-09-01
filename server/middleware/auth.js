// server/middleware/auth.js
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT
const protect = async (req, res, next) => {
  try {
    // 1) Get the token from the request headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Format: "Bearer <actual_token>"
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('Auth middleware: Received token:', token);

    // 2) Check if token exists
    if (!token) {
      console.log('Auth middleware: No token found');
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // 3) Verify the token
    try {
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      console.log('Auth middleware: Decoded token:', decoded);

      // 4) Check if the user still exists (a token might be valid but user was deleted)
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        console.log('Auth middleware: No user found for token');
        return res.status(401).json({
          status: 'fail',
          message: 'The user belonging to this token does no longer exist.'
        });
      }

      // 5) Grant access to the protected route
      req.user = currentUser;
      next();
    } catch (err) {
      console.log('Auth middleware: Token verification failed:', err.message);
      return res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
    }
  } catch (err) {
    console.log('Auth middleware: Unexpected error:', err.message);
    res.status(401).json({ status: 'fail', message: 'Invalid or expired token.' });
  }
};

module.exports = { protect };