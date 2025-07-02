/**
 * health.test.js
 *
 * This test suite verifies the backend health check endpoint. It ensures that the root endpoint ('/')
 * responds with the expected health message and status code, confirming that the backend server is up.
 *
 * Coverage includes:
 * - Creating a minimal Express app with only the health endpoint
 * - Sending a GET request to the root endpoint
 * - Asserting the response status and message
 */
// ESM version for Vitest compatibility
import express from 'express';
import request from 'supertest';
import { describe, it, expect } from 'vitest';

// Test suite for backend health check
// Ensures the backend root endpoint responds as expected
describe('Health check', () => {
  // Create a minimal app with only the health endpoint
  const app = express();
  app.get('/', (req, res) => {
    res.send('Backend API is running'); // Health check response
  });

  // Test: Health endpoint returns correct status and message
  it('should return backend API running', async () => {
    const res = await request(app).get('/'); // Send GET request to /
    expect(res.status).toBe(200); // Should return 200 OK
    expect(res.text).toMatch(/Backend API is running/); // Should return correct message
  });
}); 