// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import the User model

const router = express.Router();

// Helper function to create and send JWT token
const createSendToken = (user, statusCode, res) => {
  // 1. Create the token. Payload is the data we want to store in the token.
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '90d', // Token valid for 90 days
  });

  // 2. Remove the password from the output (even though it's hashed)
  user.password = undefined;

  // 3. Send response
  res.status(statusCode).json({
    status: 'success',
    token, // Send the token to the client
    data: {
      user // Send the user data
    }
  });
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    // Require phone or at least one social link
    const { phone, socialLinks } = req.body;
    if (!phone && (!socialLinks || Object.values(socialLinks).every(link => !link))) {
      return res.status(400).json({ status: 'fail', message: 'Please provide a phone number or at least one social media link.' });
    }
    // 1. Create a new user from the request body
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      skillsOffered: req.body.skillsOffered,
      skillsWanted: req.body.skillsWanted,
      bio: req.body.bio,
      socialLinks: req.body.socialLinks,
    });

    // 2. Log the user in immediately by sending a JWT
    createSendToken(newUser, 201, res);

  } catch (err) {
    // Handle duplicate email error
    if (err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Email is already registered.' });
    }
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ status: 'fail', message: messages.join('. ') });
    }
    // Other errors
    res.status(400).json({ status: 'fail', message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });
    }

    // 2. Find the user & select the password field explicitly (it's hidden by default in the model)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password' });
    }

    // 3. If everything is ok, send the token
    createSendToken(user, 200, res);

  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
});

module.exports = router;