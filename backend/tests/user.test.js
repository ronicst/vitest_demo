/**
 * user.test.js
 *
 * This test suite verifies the user authentication and session management routes in the backend.
 * It covers registration, login, duplicate prevention, email validation, and error handling.
 *
 * Coverage includes:
 * - Registering new users
 * - Preventing duplicate registration
 * - Logging in users
 * - Rejecting invalid logins
 * - Email validation for registration and login
 * - Data persistence in users.json
 * - Error handling for invalid operations
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import userRoutes from '../src/user.js';
import request from 'supertest';

const USERS_FILE = path.join(path.dirname(new URL(import.meta.url).pathname), '../users.json');

/**
 * Helper to mock request and response objects for testing Express routes.
 * @param {object} body - The request body
 * @param {object} session - The session object (for user auth)
 * @returns {object} { req, res } mock objects
 */
function mockReqRes(body = {}, session = {}) {
  const req = { body, session };
  const res = {
    statusCode: 200,
    jsonPayload: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.jsonPayload = payload; return this; }
  };
  return { req, res };
}

// Test suite for user routes
describe('User routes', () => {
  // Reset users.json before each test to ensure test isolation
  beforeEach(() => {
    // Reset users.json before each test
    fs.writeFileSync(USERS_FILE, '[]');
  });

  // Test: Register a new user and check if user is added
  it('registers a new user', () => {
    const { req, res } = mockReqRes({ username: 'alice@example.com', password: 'pw' }, {});
    userRoutes.handle({ ...req, method: 'POST', url: '/register' }, res, () => {}); // Simulate POST /register
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toHaveProperty('username', 'alice@example.com');
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    expect(users.length).toBe(1);
    expect(users[0].username).toBe('alice@example.com');
  });

  // Test: Prevent duplicate registration
  it('prevents duplicate registration', () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify([{ username: 'bob@example.com', password: 'pw' }]));
    const { req, res } = mockReqRes({ username: 'bob@example.com', password: 'pw' }, {});
    userRoutes.handle({ ...req, method: 'POST', url: '/register' }, res, () => {}); // Simulate POST /register
    expect(res.statusCode).toBe(409);
    expect(res.jsonPayload).toHaveProperty('error');
  });

  // Test: Log in a registered user
  it('logs in a registered user', () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify([{ username: 'carol@example.com', password: 'pw' }]));
    const { req, res } = mockReqRes({ username: 'carol@example.com', password: 'pw' }, {});
    userRoutes.handle({ ...req, method: 'POST', url: '/login' }, res, () => {}); // Simulate POST /login
    expect(res.statusCode).toBe(200);
    expect(res.jsonPayload).toHaveProperty('username', 'carol@example.com');
  });

  // Test: Reject invalid login
  it('rejects invalid login', () => {
    fs.writeFileSync(USERS_FILE, JSON.stringify([{ username: 'dave@example.com', password: 'pw' }]));
    const { req, res } = mockReqRes({ username: 'dave@example.com', password: 'wrong' }, {});
    userRoutes.handle({ ...req, method: 'POST', url: '/login' }, res, () => {}); // Simulate POST /login
    expect(res.statusCode).toBe(401);
    expect(res.jsonPayload).toHaveProperty('error');
  });

  // Test: Registration fails with invalid email
  it('registration fails with invalid email', () => {
    const { req, res } = mockReqRes({ username: 'notanemail', password: 'pw' }, {});
    userRoutes.handle({ ...req, method: 'POST', url: '/register' }, res, () => {}); // Simulate POST /register
    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toHaveProperty('error');
    expect(res.jsonPayload.error).toMatch(/valid email/i);
  });

  // Test: Login fails with invalid email
  it('login fails with invalid email', () => {
    const { req, res } = mockReqRes({ username: 'notanemail', password: 'pw' }, {});
    userRoutes.handle({ ...req, method: 'POST', url: '/login' }, res, () => {}); // Simulate POST /login
    expect(res.statusCode).toBe(400);
    expect(res.jsonPayload).toHaveProperty('error');
    expect(res.jsonPayload.error).toMatch(/valid email/i);
  });
});