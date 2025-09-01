// server/models/SwapRequest.js
const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId, // This is a reference to a User document's _id
    ref: 'User', // Tells Mongoose which model to use during population
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    maxlength: 200
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected'], // The status can only be one of these three values
    default: 'pending'
  }
}, {
  timestamps: true
});

// Optional: Compound index to prevent duplicate requests
swapRequestSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });

const SwapRequest = mongoose.model('SwapRequest', swapRequestSchema);
module.exports = SwapRequest;