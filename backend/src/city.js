/**
 * City, attraction, and restaurant management routes.
 * Handles CRUD for cities, attractions, and restaurants, with per-user data and limits.
 * Data is stored in data.json (for demo purposes).
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data.json');

/**
 * Reads the city data from data.json.
 * @returns {object} The parsed data object, or a default object if the file does not exist.
 * Side effect: Reads from the filesystem.
 */
function readData() {
  if (!fs.existsSync(DATA_FILE)) return { cities: [], latest: null }; // Return default if file missing
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')); // Parse and return data
}

/**
 * Writes the given data object to data.json.
 * @param {object} data - The data object to write.
 * Side effect: Writes to the filesystem.
 */
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); // Write formatted JSON
}

/**
 * Returns the last 10 cities for the user (or latest), with last 5 attractions/restaurants per city.
 * @param {string} username - The username to fetch cities for (or undefined for latest)
 * @returns {Array} Array of city objects, each with up to 5 attractions and 5 restaurants
 */
function getUserCities(username) {
  const data = readData();
  let cities = [];
  if (username && data[username]) cities = data[username]; // User-specific cities
  else if (data.latest) cities = data.latest; // Fallback to latest
  // Limit to last 10 cities, and last 5 attractions/restaurants per city
  cities = cities.slice(-10).map(city => ({
    ...city,
    attractions: (city.attractions || []).slice(-5),
    restaurants: (city.restaurants || []).slice(-5)
  }));
  return cities;
}

/**
 * GET /
 * Returns the list of cities for the logged-in user, or the latest cities if not logged in.
 * Responds with an array of city objects.
 */
router.get('/', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  res.json(getUserCities(username)); // Respond with city list
});

/**
 * POST /
 * Adds or updates a city for the logged-in user.
 * - Requires authentication.
 * - City name required.
 * - Limits to 10 cities per user.
 * - Limits attractions/restaurants to 5 each per city.
 * - Returns error if limits are exceeded or data is invalid.
 * Responds with the added/updated city object or error message.
 */
router.post('/', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  if (!username) return res.status(401).json({ error: 'Login required' });
  const { city } = req.body;
  if (!city || !city.name) return res.status(400).json({ error: 'City name required' });
  const data = readData();
  if (!data[username]) data[username] = [];
  const idx = data[username].findIndex(c => c.name === city.name);
  if (idx === -1 && data[username].length >= 10) {
    return res.status(400).json({ error: 'City limit (10) reached' });
  }
  // Limit attractions and restaurants to 5 each
  city.attractions = (city.attractions || []).slice(0, 5);
  city.restaurants = (city.restaurants || []).slice(0, 5);
  if (idx >= 0) {
    data[username][idx] = city; // Update existing city
  } else {
    data[username].push(city); // Add new city
  }
  data.latest = data[username]; // Update latest
  writeData(data); // Persist changes
  res.json(city); // Respond with city
});

/**
 * DELETE /:cityName
 * Deletes a city for the logged-in user.
 * - Requires authentication.
 * - Returns error if city not found.
 * Responds with a success message or error.
 */
router.delete('/:cityName', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  if (!username) return res.status(401).json({ error: 'Login required' });
  const { cityName } = req.params;
  const data = readData();
  if (!data[username]) return res.status(404).json({ error: 'No cities found' });
  data[username] = data[username].filter(c => c.name !== cityName); // Remove city
  data.latest = data[username]; // Update latest
  writeData(data); // Persist changes
  res.json({ message: 'City deleted' }); // Respond with success
});

/**
 * POST /:cityName/attractions
 * Adds an attraction to a city for the logged-in user.
 * - Requires authentication.
 * - Limits to 5 attractions per city.
 * - Returns error if limits are exceeded or city not found.
 * Responds with the updated city object or error.
 */
router.post('/:cityName/attractions', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  if (!username) return res.status(401).json({ error: 'Login required' });
  const { cityName } = req.params;
  const { attraction } = req.body;
  if (!attraction) return res.status(400).json({ error: 'Attraction required' });
  const data = readData();
  const city = (data[username] || []).find(c => c.name === cityName);
  if (!city) return res.status(404).json({ error: 'City not found' });
  city.attractions = city.attractions || [];
  if (city.attractions.length >= 5) {
    return res.status(400).json({ error: 'Attraction limit (5) reached' });
  }
  const idx = city.attractions.findIndex(a => a === attraction);
  if (idx === -1) city.attractions.push(attraction); // Add attraction if not duplicate
  data.latest = data[username]; // Update latest
  writeData(data); // Persist changes
  res.json(city); // Respond with updated city
});

/**
 * DELETE /:cityName/attractions/:attraction
 * Deletes an attraction from a city for the logged-in user.
 * - Requires authentication.
 * - Returns error if city not found.
 * Responds with the updated city object or error.
 */
router.delete('/:cityName/attractions/:attraction', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  if (!username) return res.status(401).json({ error: 'Login required' });
  const { cityName, attraction } = req.params;
  const data = readData();
  const city = (data[username] || []).find(c => c.name === cityName);
  if (!city) return res.status(404).json({ error: 'City not found' });
  city.attractions = (city.attractions || []).filter(a => a !== attraction); // Remove attraction
  data.latest = data[username]; // Update latest
  writeData(data); // Persist changes
  res.json(city); // Respond with updated city
});

/**
 * POST /:cityName/restaurants
 * Adds a restaurant to a city for the logged-in user.
 * - Requires authentication.
 * - Limits to 5 restaurants per city.
 * - Returns error if limits are exceeded or city not found.
 * Responds with the updated city object or error.
 */
router.post('/:cityName/restaurants', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  if (!username) return res.status(401).json({ error: 'Login required' });
  const { cityName } = req.params;
  const { restaurant } = req.body;
  if (!restaurant) return res.status(400).json({ error: 'Restaurant required' });
  const data = readData();
  const city = (data[username] || []).find(c => c.name === cityName);
  if (!city) return res.status(404).json({ error: 'City not found' });
  city.restaurants = city.restaurants || [];
  if (city.restaurants.length >= 5) {
    return res.status(400).json({ error: 'Restaurant limit (5) reached' });
  }
  const idx = city.restaurants.findIndex(r => r === restaurant);
  if (idx === -1) city.restaurants.push(restaurant); // Add restaurant if not duplicate
  data.latest = data[username]; // Update latest
  writeData(data); // Persist changes
  res.json(city); // Respond with updated city
});

/**
 * DELETE /:cityName/restaurants/:restaurant
 * Deletes a restaurant from a city for the logged-in user.
 * - Requires authentication.
 * - Returns error if city not found.
 * Responds with the updated city object or error.
 */
router.delete('/:cityName/restaurants/:restaurant', (req, res) => {
  const username = req.session.user && req.session.user.username; // Get username from session
  if (!username) return res.status(401).json({ error: 'Login required' });
  const { cityName, restaurant } = req.params;
  const data = readData();
  const city = (data[username] || []).find(c => c.name === cityName);
  if (!city) return res.status(404).json({ error: 'City not found' });
  city.restaurants = (city.restaurants || []).filter(r => r !== restaurant); // Remove restaurant
  data.latest = data[username]; // Update latest
  writeData(data); // Persist changes
  res.json(city); // Respond with updated city
});

module.exports = router; 