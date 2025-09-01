// server/routes/swapRequests.js
const express = require('express');
const { protect } = require('../middleware/auth');
const SwapRequest = require('../models/SwapRequest');
const User = require('../models/User');

const router = express.Router();

// Protect ALL swap request routes. You must be logged in to send or manage requests.
router.use(protect);

// POST /api/swap-requests
// Send a new swap request
router.post('/', async (req, res) => {
  try {
    const { toUserId, message } = req.body;
    const fromUserId = req.user.id; // From the protect middleware

    // 1. Check if the recipient user exists
    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return res.status(404).json({ status: 'fail', message: 'User not found.' });
    }

    // 2. Prevent users from sending requests to themselves
    if (fromUserId === toUserId) {
      return res.status(400).json({ status: 'fail', message: 'You cannot send a request to yourself.' });
    }

    // 3. Check if a request already exists (our unique index will also catch this, but we can give a nicer error message)
    const existingRequest = await SwapRequest.findOne({
      fromUser: fromUserId,
      toUser: toUserId
    });
    if (existingRequest) {
      return res.status(400).json({ status: 'fail', message: 'You have already sent a request to this user.' });
    }

    // 4. Create and save the new swap request
    const newRequest = await SwapRequest.create({
      fromUser: fromUserId,
      toUser: toUserId,
      message: message || '' // Use an empty string if no message is provided
    });

    // 5. Use .populate() to fetch details about the users, not just their IDs
    await newRequest.populate('fromUser', 'name skillsOffered'); // Only get the 'name' and 'skillsOffered' of the sender
    await newRequest.populate('toUser', 'name'); // Only get the 'name' of the recipient

    // 6. Send the successful response with the populated request data
    res.status(201).json({
      status: 'success',
      data: {
        request: newRequest
      }
    });

  } catch (err) {
    // Handle duplicate key error from MongoDB unique index
    if (err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Request already exists.' });
    }
    res.status(500).json({ status: 'error', message: 'Failed to send request.' });
  }
});


// GET /api/swap-requests/received
// Get all requests received by the logged-in user
router.get('/received', async (req, res) => {
  try {
    // 1. Find all requests where the logged-in user is the recipient
    // 2. Populate the 'fromUser' field to get the sender's details
    const receivedRequests = await SwapRequest.find({ toUser: req.user.id })
                                            .populate('fromUser', 'name skillsOffered bio') // Specify fields to include
                                            .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      status: 'success',
      results: receivedRequests.length,
      data: {
        requests: receivedRequests
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch received requests.' });
  }
});

// GET /api/swap-requests/sent
// Get all requests sent by the logged-in user
router.get('/sent', async (req, res) => {
  try {
    // 1. Find all requests where the logged-in user is the sender
    // 2. Populate the 'toUser' field to get the recipient's details
    const sentRequests = await SwapRequest.find({ fromUser: req.user.id })
                                         .populate('toUser', 'name skillsWanted bio') // Specify fields to include
                                         .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json({
      status: 'success',
      results: sentRequests.length,
      data: {
        requests: sentRequests
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch sent requests.' });
  }
});

// PATCH /api/swap-requests/:requestId
// Accept or reject a request (Only the recipient can do this)
router.patch('/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // Expecting { "status": "accepted" } or { "status": "rejected" }
    const userId = req.user.id; // The logged-in user trying to perform the action

    // 1. Find the request
    const request = await SwapRequest.findById(requestId).populate('fromUser').populate('toUser');
    if (!request) {
      return res.status(404).json({ status: 'fail', message: 'Request not found.' });
    }

    // 2. AUTHORIZATION CHECK: Ensure the logged-in user is the recipient of the request
    if (request.toUser._id.toString() !== userId) {
      // .toString() is crucial because `request.toUser` is a MongoDB ObjectId
      return res.status(403).json({ status: 'fail', message: 'You are not authorized to update this request.' });
    }

    // 3. Check if the new status is valid
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Status must be "accepted" or "rejected".' });
    }

    // 4. Update the request status
    request.status = status;
    const updatedRequest = await request.save(); // Use .save() to trigger any pre-save hooks if we had them

    // 5. Populate the user data for the response
    await updatedRequest.populate('fromUser', 'name phone socialLinks'); // Get the sender's name, phone, and social links!
    await updatedRequest.populate('toUser', 'name phone socialLinks');

    // 6. Send the successful response
    res.status(200).json({
      status: 'success',
      data: {
        request: updatedRequest
      }
    });

  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to update request.' });
  }
});

module.exports = router;