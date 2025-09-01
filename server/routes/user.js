// server/routes/user.js
const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// server/routes/user.js (add this near the top, after router is defined)

// GET /api/users
// Get a list of all users (for browsing). This is a PUBLIC route.
router.get('/', async (req, res) => {
  try {
    // 1. Filtering (optional query parameters)
    // Example: /api/users?skillsOffered=JavaScript&skillsWanted=Cooking
    let queryObj = { ...req.query };

    // 2. Basic Filtering: If query params exist, use them to find users
    // This is a very simple implementation. For a better one, you'd use advanced filtering.
    const users = await User.find(queryObj);

    // 3. Send response
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch users.' });
  }
});

// ... then the line: router.use(protect);
// ... followed by the /me and /me PATCH routes

// Protect all routes after this middleware
router.use(protect);

// GET /api/users/me
// Get the currently logged-in user's profile
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Something went wrong!' });
  }
});

// PATCH /api/users/me
// Update the currently logged-in user's profile
router.patch('/me', async (req, res) => {
  try {
    // 1. Create a filtered object to only allow specific fields to be updated
    // This prevents someone from updating sensitive fields like 'role' or '_id'
    const filteredBody = {};
    const allowedFields = ['name', 'bio', 'skillsOffered', 'skillsWanted', 'socialLinks'];

    // 2. Loop through the keys in the request body
    Object.keys(req.body).forEach(key => {
      // If the field is in the allowed list, add it to the filteredBody
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    // 3. Find the user by ID and update it with the filtered data
    // { new: true } option returns the updated document instead of the original
    // { runValidators: true } runs model validators (e.g., maxlength, email format) on update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    // 4. Send the updated user data back to the client
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });

  } catch (err) {
    // Handle validation errors or other issues
    if (err.name === 'ValidationError') {
      // Handle Mongoose validation errors (e.g., maxlength, required)
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ status: 'fail', message: messages.join('. ') });
    }
    res.status(500).json({ status: 'error', message: 'Failed to update profile.' });
  }
});

module.exports = router;