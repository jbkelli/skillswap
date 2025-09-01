// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Define the Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes unnecessary whitespace
  },
  email: {
    type: String,
    required: true,
    unique: true, // Creates a unique index in the database
    lowercase: true, // Always converts to lowercase
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'] // Basic email regex validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  bio: {
    type: String,
    maxlength: 500
  },
  skillsOffered: [{
    type: String,
    trim: true
  }],
  skillsWanted: [{
    type: String,
    trim: true
  }],
  socialLinks: {
    instagram: { type: String, trim: true },
    telegram: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },
  phone: {
    type: String,
    trim: true,
    required: false // Optional, but must be provided at signup/login
  }
}, {
  timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

// 2. Middleware: Before saving a user, hash their password
userSchema.pre('save', async function(next) {
  // Only run this function if password was modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash the password with a cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 3. Instance Method: Check if provided password is correct
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 4. Create the Model from the Schema and export it
const User = mongoose.model('User', userSchema);
module.exports = User;