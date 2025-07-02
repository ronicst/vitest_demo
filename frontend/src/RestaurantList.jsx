// RestaurantList.jsx
// Displays and manages restaurants for a city. Handles add/remove, error display, and enforces a limit of 5 restaurants per city.

import React from 'react';
import { useState } from 'react';

/**
 * RestaurantList Component
 *
 * Displays and manages a list of restaurants for a city. Allows adding and removing restaurants,
 * displays error messages, and enforces a limit of 5 restaurants per city.
 *
 * Props:
 *   - restaurants: array of restaurant names
 *   - cityName: name of the city (for handler calls)
 *   - onAdd: function to add a new restaurant
 *   - onDelete: function to delete a restaurant
 *   - loggedIn: boolean, true if user is logged in
 *   - error: error message to display (for restaurant actions)
 *
 * State:
 *   - newRestaurant: string, value of the new restaurant input field
 *
 * Returns:
 *   - Renders a list of restaurants with remove buttons (if logged in)
 *   - Renders an add form if under the limit and logged in
 */
export default function RestaurantList({ restaurants, cityName, onAdd, onDelete, loggedIn, error }) {
  // State for new restaurant input
  const [newRestaurant, setNewRestaurant] = useState('');
  return (
    <div className="restaurant-list bright-section">
      <h4>Restaurants</h4>
      {/* Show error message if present */}
      {error && <div className="error-msg">{error}</div>}
      {/* List of restaurants with remove buttons (if logged in) */}
      <div>
        {(restaurants || []).map(r => (
          <div key={r} className="restaurant-row">
            {/* Display restaurant name, wrapped for long names */}
            <span className="wrap-name">{r}</span>
            {/* Remove button, only if logged in */}
            {loggedIn && <button className="remove-btn" onClick={() => onDelete(r)}>Remove</button>}
          </div>
        ))}
      </div>
      {/* Add restaurant form, only visible if under limit and logged in */}
      {loggedIn && restaurants.length < 5 && (
        <form className="add-form" onSubmit={e => { e.preventDefault(); onAdd(newRestaurant); setNewRestaurant(''); }}>
          <input
            type="text"
            placeholder="Add restaurant"
            value={newRestaurant}
            onChange={e => setNewRestaurant(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}
    </div>
  );
} 