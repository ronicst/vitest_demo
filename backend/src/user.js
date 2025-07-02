/**
 * User authentication and session management routes.
 * Handles registration, login, logout, and session check.
 * Stores users in users.json (for demo purposes).
 */
const path = require('path');
const express = require('express');
const fs = require('fs');
const router = express.Router();

const USERS_FILE = path.join(__dirname, '../users.json');

/**
 * Reads the list of users from the users.json file.
 * @returns {Array} Array of user objects, or an empty array if the file does not exist.
 * Side effect: Reads from the filesystem.
 */
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return []; // Return empty array if file missing
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8')); // Parse and return users
}

/**
 * Writes the given users array to the users.json file.
 * @param {Array} users - Array of user objects to write.
 * Side effect: Writes to the filesystem.
 */
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2)); // Write formatted JSON
}

/**
 * Validates that the username is a valid email address.
 * @param {string} email - The email to validate.
 * @returns {boolean} True if valid email, false otherwise.
 */
function isValidEmail(email) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email); // Simple regex for email validation
}

/**
 * POST /register
 * Registers a new user if the username (email) is not taken.
 * - Requires username (email) and password.
 * - Validates email format.
 * - Stores user in users.json and sets session.
 * - Returns error if user exists or data is invalid.
 * Responds with the new user's username or error message.
 */
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  if (!isValidEmail(username)) return res.status(400).json({ error: 'A valid email is required' });
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'User already exists' });
  }
  users.push({ username, password }); // Add new user
  writeUsers(users); // Persist users
  req.session.user = { username }; // Set session
  res.json({ username }); // Respond with username
});

/**
 * POST /login
 * Logs in a user if credentials are valid.
 * - Requires username (email) and password.
 * - Validates email format.
 * - Sets session if successful.
 * - Returns error for invalid credentials or email.
 * Responds with the user's username or error message.
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!isValidEmail(username)) return res.status(400).json({ error: 'A valid email is required' });
  const users = readUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.user = { username }; // Set session
  res.json({ username }); // Respond with username
});

/**
 * POST /logout
 * Logs out the current user by destroying the session.
 * Responds with a success message.
 */
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' }); // Respond with success
  });
});

/**
 * GET /me
 * Returns the current logged-in user's username, or 401 if not logged in.
 * Responds with the username or error message.
 */
router.get('/me', (req, res) => {
  if (req.session.user) {
    res.json({ username: req.session.user.username }); // Respond with username
  } else {
    res.status(401).json({ error: 'Not logged in' }); // Respond with error
  }
});

module.exports = router; 