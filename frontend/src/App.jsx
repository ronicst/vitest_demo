// App.jsx
// Main entry point for the React frontend. Handles authentication, city/attraction/restaurant CRUD, error handling, and conditional rendering.

import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './LoginForm';
import CityList from './CityList';

const API = 'http://localhost:3001/api';

/**
 * App Component
 *
 * The root component for the frontend application. Manages global state for user session, city data,
 * error messages, and loading state. Handles all authentication and CRUD operations for cities,
 * attractions, and restaurants, and passes handlers and data to child components.
 *
 * State:
 *   - user: current logged-in user (object or null)
 *   - cities: array of city objects for the user
 *   - error: error message for login/register
 *   - cityError: error message for city/attraction/restaurant actions
 *   - loading: boolean, true while checking session on mount
 *
 * Side effects:
 *   - On mount, checks user session and fetches cities
 *   - Refetches cities when user changes (login/logout)
 *
 * Returns:
 *   - Renders LoginForm and CityList if not logged in
 *   - Renders CityList and user info if logged in
 */
function App() {
  // State for user session, city data, errors, and loading
  const [user, setUser] = useState(null);
  const [cities, setCities] = useState([]);
  const [error, setError] = useState(''); // For login/register errors
  const [cityError, setCityError] = useState(''); // For city/attraction/restaurant errors
  const [loading, setLoading] = useState(true);

  /**
   * useEffect: On mount, check if user is logged in (session)
   * - Calls backend /users/me endpoint to check session
   * - Sets user state if logged in, sets loading to false when done
   */
  useEffect(() => {
    fetch(`${API}/users/me`, { credentials: 'include' }) // API call to check session
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.username) setUser({ username: data.username }); // Set user if session exists
      })
      .catch(error => {
        // Handle network or JSON parsing errors gracefully
        console.error('Session check error:', error.message);
      })
      .finally(() => setLoading(false)); // Always clear loading
  }, []);

  /**
   * useEffect: Fetch cities for the current user (or latest if not logged in)
   * - Calls backend /cities endpoint
   * - Updates cities state
   * - Runs on mount and whenever user changes (login/logout)
   */
  useEffect(() => {
    fetch(`${API}/cities`, { credentials: 'include' }) // API call to get cities
      .then(r => r.json())
      .then(setCities) // Update cities state
      .catch(error => {
        // Handle network or JSON parsing errors gracefully
        console.error('Cities fetch error:', error.message);
        setCities([]); // Set empty array as fallback
      });
  }, [user]);

  /**
   * handleAuth
   * Handles login or registration.
   * @param {string} mode - 'login' or 'register'
   * @param {object} param1 - { username, password }
   * - Calls backend /users/login or /users/register
   * - Sets user state on success, error state on failure
   */
  const handleAuth = (mode, { username, password }) => {
    setError('');
    fetch(`${API}/users/${mode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Auth failed'); // Handle backend error
        return r.json();
      })
      .then(data => setUser({ username: data.username })) // Set user on success
      .catch(e => setError(e.message)); // Set error on failure
  };

  /**
   * handleLogout
   * Logs out the current user.
   * - Calls backend /users/logout
   * - Clears user state on success
   */
  const handleLogout = () => {
    fetch(`${API}/users/logout`, { method: 'POST', credentials: 'include' }) // API call to logout
      .then(() => setUser(null)); // Clear user state
  };

  /**
   * refreshCities
   * Fetches the latest cities from the backend and updates state.
   * - Calls backend /cities endpoint
   */
  const refreshCities = () => {
    fetch(`${API}/cities`, { credentials: 'include' }) // API call to get cities
      .then(r => r.json())
      .then(setCities) // Update cities state
      .catch(error => {
        // Handle network or JSON parsing errors gracefully
        console.error('Cities refresh error:', error.message);
        setCities([]); // Set empty array as fallback
      });
  };

  /**
   * handleAddCity
   * Prompts for a new city name and adds it for the user.
   * - Calls backend /cities POST endpoint
   * - Handles city limit and error display
   */
  const handleAddCity = () => {
    const name = prompt('City name?'); // Prompt user for city name
    if (!name) return;
    setCityError('');
    fetch(`${API}/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ city: { name, attractions: [], restaurants: [] } })
    })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Error adding city'); // Handle backend error
        return r.json();
      })
      .then(refreshCities) // Refresh city list on success
      .catch(e => setCityError(e.message)); // Show error message
  };

  /**
   * handleUpdateCity
   * Prompts for a new city name and updates the city.
   * - Calls backend /cities POST endpoint with updated name
   */
  const handleUpdateCity = (city) => {
    const name = prompt('New city name?', city.name); // Prompt for new name
    if (!name) return;
    fetch(`${API}/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ city: { ...city, name } })
    }).then(refreshCities); // Refresh city list
  };

  /**
   * handleDeleteCity
   * Deletes a city by name.
   * - Calls backend /cities/:cityName DELETE endpoint
   */
  const handleDeleteCity = (cityName) => {
    fetch(`${API}/cities/${encodeURIComponent(cityName)}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(refreshCities); // Refresh city list
  };

  /**
   * handleAddAttraction
   * Adds an attraction to a city (enforced limit in backend).
   * - Calls backend /cities/:cityName/attractions POST endpoint
   * - Handles error display
   */
  const handleAddAttraction = (cityName, attraction) => {
    if (!attraction) return;
    setCityError('');
    fetch(`${API}/cities/${encodeURIComponent(cityName)}/attractions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ attraction })
    })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Error adding attraction'); // Handle backend error
        return r.json();
      })
      .then(refreshCities) // Refresh city list on success
      .catch(e => setCityError(e.message)); // Show error message
  };

  /**
   * handleDeleteAttraction
   * Deletes an attraction from a city.
   * - Calls backend /cities/:cityName/attractions/:attraction DELETE endpoint
   */
  const handleDeleteAttraction = (cityName, attraction) => {
    fetch(`${API}/cities/${encodeURIComponent(cityName)}/attractions/${encodeURIComponent(attraction)}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(refreshCities); // Refresh city list
  };

  /**
   * handleAddRestaurant
   * Adds a restaurant to a city (enforced limit in backend).
   * - Calls backend /cities/:cityName/restaurants POST endpoint
   * - Handles error display
   */
  const handleAddRestaurant = (cityName, restaurant) => {
    if (!restaurant) return;
    setCityError('');
    fetch(`${API}/cities/${encodeURIComponent(cityName)}/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ restaurant })
    })
      .then(async r => {
        if (!r.ok) throw new Error((await r.json()).error || 'Error adding restaurant'); // Handle backend error
        return r.json();
      })
      .then(refreshCities) // Refresh city list on success
      .catch(e => setCityError(e.message)); // Show error message
  };

  /**
   * handleDeleteRestaurant
   * Deletes a restaurant from a city.
   * - Calls backend /cities/:cityName/restaurants/:restaurant DELETE endpoint
   */
  const handleDeleteRestaurant = (cityName, restaurant) => {
    fetch(`${API}/cities/${encodeURIComponent(cityName)}/restaurants/${encodeURIComponent(restaurant)}`, {
      method: 'DELETE',
      credentials: 'include'
    }).then(refreshCities); // Refresh city list
  };

  /**
   * handleClearError
   * Clears the login/register error (used when toggling login/register mode)
   */
  const handleClearError = () => setError('');

  // Show loading indicator while checking session
  if (loading) return <div>Loading...</div>;

  // Render login/register or main app UI based on user session
  return (
    <div className="App">
      <h1>Top Cities Tool</h1>
      {user ? (
        <>
          {/* Show welcome message and logout button for logged-in user */}
          <div>Welcome, {user.username}! <button onClick={handleLogout}>Logout</button></div>
          {/* Pass all handlers and data to CityList */}
          <CityList
            cities={cities}
            onAddCity={handleAddCity}
            onUpdateCity={handleUpdateCity}
            onDeleteCity={handleDeleteCity}
            onAddAttraction={handleAddAttraction}
            onDeleteAttraction={handleDeleteAttraction}
            onAddRestaurant={handleAddRestaurant}
            onDeleteRestaurant={handleDeleteRestaurant}
            loggedIn={!!user}
            error={cityError}
          />
        </>
      ) : (
        <>
          {/* Show login/register form and city list for guests */}
          <LoginForm onAuth={handleAuth} error={error} onToggleMode={handleClearError} />
          <CityList
            cities={cities}
            loggedIn={false}
            error={cityError}
          />
        </>
      )}
    </div>
  );
}

export default App;
