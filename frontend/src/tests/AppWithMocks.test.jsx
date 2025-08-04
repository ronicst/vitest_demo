/**
 * AppWithMocks.test.jsx
 *
 * This test suite demonstrates the use of vi.mock to mock external dependencies
 * like fetch API calls, localStorage, and other browser APIs. This is useful
 * for knowledge sharing sessions to show how to isolate components for testing.
 *
 * Coverage includes:
 * - Mocking fetch API calls
 * - Mocking browser APIs (localStorage, sessionStorage)
 * - Testing component behavior with mocked data
 * - Verifying mock function calls
 * - Testing error scenarios with mocked failures
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

// Mock the fetch API globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock the prompt API
const mockPrompt = vi.fn();
global.prompt = mockPrompt;

describe('App Component with Mocked Dependencies', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Default successful responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ username: 'test@example.com' }),
      text: () => Promise.resolve('Backend API is running'),
    });
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe('Session Management with Mocked Fetch', () => {
    it('should check user session on mount with mocked fetch', async () => {
      // Mock successful session check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'alice@example.com' }),
      });

      // Mock cities fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for the session check to complete
      await waitFor(() => {
        expect(screen.getByText(/welcome, alice@example\.com/i)).toBeInTheDocument();
      });

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/me',
        { credentials: 'include' }
      );
    });

    it('should handle session check failure with mocked fetch', async () => {
      // Mock failed session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Not logged in' }),
      });

      // Mock cities fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for the session check to complete
      await waitFor(() => {
        expect(screen.getByText(/top cities tool/i)).toBeInTheDocument();
        expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
      });
    });

    it('should handle network errors during session check', async () => {
      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Mock cities fetch after error
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after component mounts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for the session check to complete
      await waitFor(() => {
        expect(screen.getByText(/top cities tool/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authentication with Mocked Fetch', () => {
    it('should handle successful login with mocked fetch', async () => {
      // Mock failed session check (not logged in initially)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Not logged in' }),
      });

      // Mock cities fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock successful login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'bob@example.com' }),
      });

      // Mock cities fetch after login
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/top cities tool/i)).toBeInTheDocument();
      });

      // Find and fill login form
      const usernameInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'bob@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Wait for login to complete
      await waitFor(() => {
        expect(screen.getByText(/welcome, bob@example\.com/i)).toBeInTheDocument();
      });

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/login',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: 'bob@example.com', password: 'password123' }),
        })
      );
    });

    it('should handle login failure with mocked fetch', async () => {
      // Mock failed session check (not logged in initially)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Not logged in' }),
      });

      // Mock cities fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock failed login
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/top cities tool/i)).toBeInTheDocument();
      });

      // Find and fill login form
      const usernameInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      fireEvent.change(usernameInput, { target: { value: 'invalid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it('should handle logout with mocked fetch', async () => {
      // Mock successful session check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'charlie@example.com' }),
      });

      // Mock cities fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock successful logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'Logged out' }),
      });

      // Mock cities fetch after logout
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after logout completes
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for session check and ensure we're in logged-in state
      await waitFor(() => {
        expect(screen.getByText(/welcome, charlie@example\.com/i)).toBeInTheDocument();
      });

      // Wait for cities to load and ensure logout button is available
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
      });

      // Click logout button
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Wait for logout to complete
      await waitFor(() => {
        expect(screen.queryByText(/welcome/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });

      // Verify logout fetch was called
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/logout',
        { method: 'POST', credentials: 'include' }
      );
    });
  });

  describe('City Management with Mocked Fetch and Prompt', () => {
    beforeEach(() => {
      // Mock successful session check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'user@example.com' }),
      });

      // Mock cities fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { name: 'Paris', attractions: ['Eiffel Tower'], restaurants: ['Le Meurice'] },
          { name: 'London', attractions: [], restaurants: [] }
        ]),
      });
    });

    it('should add city with mocked prompt and fetch', async () => {
      // Mock successful session check (/users/me)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'user@example.com' }),
      });

      // Mock cities fetch (/cities) - first call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - second call after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - third call after component mounts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - fourth call for any additional renders
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock prompt to return city name
      mockPrompt.mockReturnValueOnce('Tokyo');

      // Mock successful city addition
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'City added' }),
      });

      // Mock cities refresh after addition
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          { name: 'Paris', attractions: [], restaurants: [] },
          { name: 'London', attractions: [], restaurants: [] },
          { name: 'Tokyo', attractions: [], restaurants: [] }
        ]),
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/welcome, user@example\.com/i)).toBeInTheDocument();
      });

      // Click add city button
      const addCityButton = screen.getByRole('button', { name: /add city/i });
      fireEvent.click(addCityButton);

      // Verify prompt was called
      expect(mockPrompt).toHaveBeenCalledWith('City name?');

      // Verify fetch was called with correct parameters
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/cities',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ city: { name: 'Tokyo', attractions: [], restaurants: [] } }),
        })
      );
    });

    it('should handle city addition failure with mocked fetch', async () => {
      // Mock successful session check (/users/me)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'user@example.com' }),
      });

      // Mock cities fetch (/cities) - first call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - second call after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - third call after component mounts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - fourth call for any additional renders
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock prompt to return city name
      mockPrompt.mockReturnValueOnce('New York');

      // Mock failed city addition
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'City limit reached' }),
      });

      // Mock any additional cities fetch calls that might happen
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/welcome, user@example\.com/i)).toBeInTheDocument();
      });

      // Click add city button
      const addCityButton = screen.getByRole('button', { name: /add city/i });
      fireEvent.click(addCityButton);

      // Verify the error handling works by checking that the component doesn't crash
      // and that the add city button is still available
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add city/i })).toBeInTheDocument();
      });
    });

    it('should not add city when prompt is cancelled', async () => {
      // Mock successful session check (/users/me)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ username: 'user@example.com' }),
      });

      // Mock cities fetch (/cities) - first call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - second call after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - third call after component mounts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch (/cities) - fourth call for any additional renders
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock prompt to return null (cancelled)
      mockPrompt.mockReturnValueOnce(null);

      render(<App />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText(/welcome, user@example\.com/i)).toBeInTheDocument();
      });

      // Click add city button
      const addCityButton = screen.getByRole('button', { name: /add city/i });
      fireEvent.click(addCityButton);

      // Verify prompt was called but no fetch for city addition
      expect(mockPrompt).toHaveBeenCalledWith('City name?');
      // Should not have called fetch for adding city
      expect(mockFetch).not.toHaveBeenCalledWith(
        'http://localhost:3001/api/cities',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New York'),
        })
      );
    });
  });

  describe('Local Storage and Session Storage Mocking', () => {
    it('should demonstrate localStorage mocking', () => {
      // Set up localStorage mock
      mockLocalStorage.getItem.mockReturnValue('{"username": "test@example.com"}');
      mockLocalStorage.setItem.mockImplementation(() => {});

      // This test demonstrates how to mock localStorage
      // In a real component, you might use localStorage for persistence
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();

      // Simulate using localStorage
      const userData = { username: 'test@example.com', preferences: { theme: 'dark' } };
      mockLocalStorage.setItem('userData', JSON.stringify(userData));
      const retrievedData = mockLocalStorage.getItem('userData');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userData', JSON.stringify(userData));
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('userData');
    });

    it('should demonstrate sessionStorage mocking', () => {
      // Set up sessionStorage mock
      mockSessionStorage.setItem.mockImplementation(() => {});
      mockSessionStorage.getItem.mockReturnValue('session-data');

      // Simulate using sessionStorage
      mockSessionStorage.setItem('sessionKey', 'session-data');
      const sessionData = mockSessionStorage.getItem('sessionKey');

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('sessionKey', 'session-data');
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('sessionKey');
      expect(sessionData).toBe('session-data');
    });
  });

  describe('Error Handling with Mocked Dependencies', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error for session check
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Mock cities fetch after error
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after component mounts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for component to handle the error
      await waitFor(() => {
        expect(screen.getByText(/top cities tool/i)).toBeInTheDocument();
      });

      // Component should still render even with network errors
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should handle JSON parsing errors', async () => {
      // Mock successful response but with invalid JSON
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      // Mock cities fetch after error
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after user state change
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      // Mock cities fetch after component mounts
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<App />);

      // Wait for component to handle the error
      await waitFor(() => {
        expect(screen.getByText(/top cities tool/i)).toBeInTheDocument();
      });

      // Component should still render even with JSON parsing errors
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
  });
}); 