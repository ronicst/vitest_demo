import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

/**
 * This test verifies that the backend health endpoint (backend API) is running 
 * and reachable from the frontend environment.
 *
 * What it does:
 * - Sends a GET request to the backend root endpoint ('http://localhost:3001/').
 * - Expects a 200 OK response status, indicating the backend server is up.
 * - Expects the response text to include 'Backend API is running', confirming the backend health endpoint is working as intended.
 *
 * Why this is useful:
 * - Ensures the backend server is operational before running further integration or frontend tests.
 * - Provides a quick, automated way to catch issues with backend availability or misconfiguration.
 * - Useful in CI/CD pipelines to verify the backend is up before deploying or running end-to-end tests.
 */
describe('Backend Health Endpoint', () => {
  it('should return backend API running', async () => {
    const res = await fetch('http://localhost:3001/');
    const text = await res.text();
    expect(res.status).toBe(200);
    expect(text).toMatch(/Backend API is running/);
  });
});

/**
 * The following test ensures that the main heading of the React app is rendered correctly
 * and the app is healthy.
 * 
 * Why async/await and findByRole?
 * - The <App /> component performs asynchronous data fetching on mount (e.g., checking user session, loading cities).
 * - While this data is being fetched, the component displays a 'Loading...' message and does NOT render the main heading.
 * - Only after the fetch completes and loading is set to false does the heading <h1>Top Cities Tool</h1> appear in the DOM.
 * - Therefore, we use 'await screen.findByRole(...)' to wait for the heading to appear after the async operation completes.
 * - This ensures the test does not fail by checking for the heading too early, before the app has finished loading.
 *
 * This approach is necessary for any component that conditionally renders content based on asynchronous state changes.
 */
describe('Frontend React App Health', () => {
  it('should render the main heading', async () => {
    render(<App />);
    // The main heading should always be present if the app is running
    expect(await screen.findByRole('heading', { name: /top cities tool/i })).toBeInTheDocument();
  });
}); 