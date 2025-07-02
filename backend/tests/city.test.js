/**
 * city.test.js
 *
 * This test suite verifies the city, attraction, and restaurant management routes in the backend.
 * It covers CRUD operations, per-user data isolation, and enforcement of city/attraction/restaurant limits.
 *
 * Coverage includes:
 * - Adding, deleting, and listing cities for users
 * - Adding attractions and restaurants to cities
 * - Enforcing city, attraction, and restaurant limits
 * - Ensuring only the last N items are returned
 * - Data isolation between users
 * - Error handling for invalid operations
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import cityRoutes from '../src/city.js';

const DATA_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), '../data.json');

/**
 * Helper to mock request and response objects for testing Express routes.
 * @param {object} body - The request body
 * @param {object} session - The session object (for user auth)
 * @param {object} params - The route params
 * @returns {object} { req, res } mock objects
 */
function mockReqRes(body = {}, session = {}, params = {}) {
  const req = { body, session, params };
  const res = {
    statusCode: 200,
    jsonPayload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.jsonPayload = payload; return this; }
  };
  return { req, res };
}

// Test suite for city routes
describe('City routes', () => {
  // Reset data.json before each test to ensure test isolation
  beforeEach(() => {
    // Reset data.json before each test
    fs.writeFileSync(DATA_FILE, '{}');
  });

  // Test: Returns empty array for guest (not logged in)
  it('returns empty for guest', () => {
    const { req, res } = mockReqRes({}, {}, {});
    cityRoutes.handle({ ...req, method: 'GET', url: '/' }, res, () => {}); // Simulate GET /
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toEqual([]);
  });

  // Test: Adds a city for a user
  it('adds a city for a user', () => {
    const session = { user: { username: 'alice' } };
    const city = { name: 'Paris', attractions: [], restaurants: [] };
    const { req, res } = mockReqRes({ city }, session, {});
    cityRoutes.handle({ ...req, method: 'POST', url: '/' }, res, () => {}); // Simulate POST /
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload.name).toBe('Paris');
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    expect(data['alice'][0].name).toBe('Paris');
  });

  // Test: Deletes a city for a user
  it('deletes a city for a user', () => {
    const session = { user: { username: 'bob' } };
    const data = { bob: [{ name: 'London', attractions: [], restaurants: [] }], latest: [{ name: 'London', attractions: [], restaurants: [] }] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    const { req, res } = mockReqRes({}, session, { cityName: 'London' });
    cityRoutes.handle({ ...req, method: 'DELETE', url: '/London' }, res, () => {}); // Simulate DELETE /:cityName
    expect(res.statusCode).toBe(200);
    const updated = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    expect(updated['bob'].length).toBe(0);
  });

  // Test: Adds an attraction to a city
  it('adds an attraction to a city', () => {
    const session = { user: { username: 'carol' } };
    const data = { carol: [{ name: 'Rome', attractions: [], restaurants: [] }], latest: [{ name: 'Rome', attractions: [], restaurants: [] }] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    const { req, res } = mockReqRes({ attraction: 'Colosseum' }, session, { cityName: 'Rome' });
    cityRoutes.handle({ ...req, method: 'POST', url: '/Rome/attractions' }, res, () => {}); // Simulate POST /:cityName/attractions
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload.attractions).toContain('Colosseum');
  });

  // Test: Adds a restaurant to a city
  it('adds a restaurant to a city', () => {
    const session = { user: { username: 'dave' } };
    const data = { dave: [{ name: 'Berlin', attractions: [], restaurants: [] }], latest: [{ name: 'Berlin', attractions: [], restaurants: [] }] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    const { req, res } = mockReqRes({ restaurant: 'Curry 36' }, session, { cityName: 'Berlin' });
    cityRoutes.handle({ ...req, method: 'POST', url: '/Berlin/restaurants' }, res, () => {}); // Simulate POST /:cityName/restaurants
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload.restaurants).toContain('Curry 36');
  });

  // Test: Enforces city limit (10 per user)
  it('enforces city limit (10 per user)', () => {
    const session = { user: { username: 'eve' } };
    // Add 10 cities
    for (let i = 0; i < 10; i++) {
      const city = { name: `City${i}`, attractions: [], restaurants: [] };
      const { req, res } = mockReqRes({ city }, session, {});
      cityRoutes.handle({ ...req, method: 'POST', url: '/' }, res, () => {}); // Simulate POST /
      expect(res.statusCode).toBe(200);
    }
    // Try to add 11th city
    const city = { name: 'City10', attractions: [], restaurants: [] };
    const { req, res } = mockReqRes({ city }, session, {});
    cityRoutes.handle({ ...req, method: 'POST', url: '/' }, res, () => {}); // Simulate POST /
    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toHaveProperty('error');
  });

  // Test: Enforces attraction limit (5 per city)
  it('enforces attraction limit (5 per city)', () => {
    const session = { user: { username: 'frank' } };
    const data = { frank: [{ name: 'Rome', attractions: [], restaurants: [] }], latest: [{ name: 'Rome', attractions: [], restaurants: [] }] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    // Add 5 attractions
    for (let i = 0; i < 5; i++) {
      const { req, res } = mockReqRes({ attraction: `Attraction${i}` }, session, { cityName: 'Rome' });
      cityRoutes.handle({ ...req, method: 'POST', url: '/Rome/attractions' }, res, () => {}); // Simulate POST /:cityName/attractions
      expect(res.statusCode).toBe(200);
    }
    // Try to add 6th attraction
    const { req, res } = mockReqRes({ attraction: 'Attraction5' }, session, { cityName: 'Rome' });
    cityRoutes.handle({ ...req, method: 'POST', url: '/Rome/attractions' }, res, () => {}); // Simulate POST /:cityName/attractions
    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toHaveProperty('error');
  });

  // Test: Enforces restaurant limit (5 per city)
  it('enforces restaurant limit (5 per city)', () => {
    const session = { user: { username: 'gina' } };
    const data = { gina: [{ name: 'Berlin', attractions: [], restaurants: [] }], latest: [{ name: 'Berlin', attractions: [], restaurants: [] }] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    // Add 5 restaurants
    for (let i = 0; i < 5; i++) {
      const { req, res } = mockReqRes({ restaurant: `Restaurant${i}` }, session, { cityName: 'Berlin' });
      cityRoutes.handle({ ...req, method: 'POST', url: '/Berlin/restaurants' }, res, () => {}); // Simulate POST /:cityName/restaurants
      expect(res.statusCode).toBe(200);
    }
    // Try to add 6th restaurant
    const { req, res } = mockReqRes({ restaurant: 'Restaurant5' }, session, { cityName: 'Berlin' });
    cityRoutes.handle({ ...req, method: 'POST', url: '/Berlin/restaurants' }, res, () => {}); // Simulate POST /:cityName/restaurants
    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toHaveProperty('error');
  });

  // Test: GET only returns up to 10 cities and 5 attractions/restaurants per city
  it('GET only returns up to 10 cities and 5 attractions/restaurants per city', () => {
    const session = { user: { username: 'hank' } };
    // Create 12 cities, each with 7 attractions and 7 restaurants
    const cities = [];
    for (let i = 0; i < 12; i++) {
      cities.push({
        name: `City${i}`,
        attractions: Array.from({ length: 7 }, (_, j) => `A${j}`),
        restaurants: Array.from({ length: 7 }, (_, j) => `R${j}`)
      });
    }
    const data = { hank: cities, latest: cities };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    const { req, res } = mockReqRes({}, session, {});
    cityRoutes.handle({ ...req, method: 'GET', url: '/' }, res, () => {}); // Simulate GET /
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload.length).toBe(10);
    for (const city of res.jsonPayload) {
      expect(city.attractions.length).toBeLessThanOrEqual(5);
      expect(city.restaurants.length).toBeLessThanOrEqual(5);
    }
  });

  // Test: GET returns the last 10 cities, not the first 10
  it('GET returns the last 10 cities, not the first 10', () => {
    const session = { user: { username: 'lastcities' } };
    // Create 15 cities
    const cities = [];
    for (let i = 0; i < 15; i++) {
      cities.push({ name: `City${i}`, attractions: [], restaurants: [] });
    }
    const data = { lastcities: cities, latest: cities };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    const { req, res } = mockReqRes({}, session, {});
    cityRoutes.handle({ ...req, method: 'GET', url: '/' }, res, () => {}); // Simulate GET /
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload.length).toBe(10);
    // Should be City5 to City14
    expect(res.jsonPayload[0].name).toBe('City5');
    expect(res.jsonPayload[9].name).toBe('City14');
  });

  // Test: GET returns the last 5 attractions/restaurants, not the first 5
  it('GET returns the last 5 attractions/restaurants, not the first 5', () => {
    const session = { user: { username: 'lastitems' } };
    const city = {
      name: 'TestCity',
      attractions: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6'],
      restaurants: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6']
    };
    const data = { lastitems: [city], latest: [city] };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
    const { req, res } = mockReqRes({}, session, {});
    cityRoutes.handle({ ...req, method: 'GET', url: '/' }, res, () => {}); // Simulate GET /
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload.length).toBe(1);
    expect(res.jsonPayload[0].attractions).toEqual(['A2', 'A3', 'A4', 'A5', 'A6']);
    expect(res.jsonPayload[0].restaurants).toEqual(['R2', 'R3', 'R4', 'R5', 'R6']);
  });

  // Clean up after all tests
  afterAll(() => {
    fs.writeFileSync(DATA_FILE, '{}');
  });
});