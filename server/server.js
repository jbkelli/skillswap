// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000; // Use the port from .env or default to 5000

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse incoming requests with JSON payloads

// Import Routes
const authRoutes = require('./routes/auth');

// Use Routes
// The '/api/auth' means all routes in authRoutes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);

// Import the new user routes
const userRoutes = require('./routes/user');
// Use the routes. All routes in userRoutes are now protected!
app.use('/api/users', userRoutes);

// Import the swap request routes
const swapRequestRoutes = require('./routes/SwapRequests');
// Use the routes. All routes in swapRequestRoutes are protected!
app.use('/api/swap-requests', swapRequestRoutes);

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
  socketTimeoutMS: 45000, // Increase socket timeout
})
.then(() => console.log('MongoDB connected successfully!'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  console.error('Error name:', err.name);
  console.error('Error message:', err.message);
});
// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap Server is running!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});