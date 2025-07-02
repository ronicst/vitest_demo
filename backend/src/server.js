/**
 * Main entry point for the backend Express server.
 * Sets up middleware, session, CORS, and mounts user/city routes.
 * Serves as the API for authentication and city/attraction/restaurant management.
 */
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const userRoutes = require('./user');
const cityRoutes = require('./city');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend (Vite default port)
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend requests
  credentials: true
}));
// Parse JSON request bodies
app.use(express.json());
// Parse cookies
app.use(cookieParser());
// Set up session management (in-memory for demo)
app.use(session({
  secret: 'demo-secret', // In production, use a secure secret and store sessions securely
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// Mount user authentication and city management routes
app.use('/api/users', userRoutes);
app.use('/api/cities', cityRoutes);

// Root endpoint for health check
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 