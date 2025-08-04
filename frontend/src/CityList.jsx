// CityList.jsx
// Displays a list of cities with expand/collapse, add, edit, and delete functionality. Handles error display and passes handlers to child components.

import React, { useState } from 'react';
import AttractionList from './AttractionList';
import RestaurantList from './RestaurantList';

/**
 * CityList Component
 *
 * Displays a list of cities with expand/collapse, add, edit, and delete functionality.
 * Handles error display and passes handler functions and data to child components (AttractionList, RestaurantList).
 *
 * Props:
 *   - cities: array of city objects to display
 *   - onAddCity: function to add a new city
 *   - onUpdateCity: function to update a city's name
 *   - onDeleteCity: function to delete a city
 *   - onAddAttraction: function to add an attraction to a city
 *   - onDeleteAttraction: function to delete an attraction from a city
 *   - onAddRestaurant: function to add a restaurant to a city
 *   - onDeleteRestaurant: function to delete a restaurant from a city
 *   - loggedIn: boolean, true if user is logged in
 *   - error: error message to display (for city/attraction/restaurant actions)
 *
 * State:
 *   - expanded: object mapping city names to boolean (expanded/collapsed)
 *
 * Returns:
 *   - Renders a list of city cards, each with expand/collapse, edit, and delete buttons
 *   - Renders AttractionList and RestaurantList for each expanded city
 */
export default function CityList({ cities, onAddCity, onUpdateCity, onDeleteCity, onAddAttraction, onDeleteAttraction, onAddRestaurant, onDeleteRestaurant, loggedIn, error }) {
  // State to track which cities are expanded
  const [expanded, setExpanded] = useState({});
  /**
   * toggle
   * Toggles the expanded/collapsed state for a city.
   * @param {string} cityName - The name of the city to toggle
   */
  const toggle = cityName => setExpanded(e => ({ ...e, [cityName]: !e[cityName] }));
  
  // Ensure cities is always an array
  const safeCities = Array.isArray(cities) ? cities : [];
  
  return (
    <div className="city-list">
      <h2>Top 10 Cities in Europe</h2>
      {/* Show error message if present */}
      {error && <div className="error-msg">{error}</div>}
      {/* Show Add City button only if logged in and under limit */}
      {loggedIn && safeCities.length < 10 && (
        <button className="add-btn" onClick={() => onAddCity()}>Add City</button>
      )}
      {/* Show message if no cities exist */}
      {safeCities.length === 0 && <div className="no-cities">The list is still building it...</div>}
      {/* Render each city as a card with expand/collapse and actions */}
      {safeCities.map(city => (
        <div key={city.name} className="city-item bright-card">
          <div className="city-header">
            {/* City name, wrapped for long names */}
            <h3 className="wrap-name">{city.name}</h3>
            {/* Expand/collapse button for city details */}
            <button className="expand-btn" onClick={() => toggle(city.name)}>
              {expanded[city.name] ? 'Collapse' : 'Expand'}
            </button>
            {/* Edit and Delete buttons, only if logged in */}
            {loggedIn && (
              <>
                <button className="edit-btn" onClick={() => onUpdateCity(city)}>Edit</button>
                <button className="delete-btn" onClick={() => onDeleteCity(city.name)}>Delete</button>
              </>
            )}
          </div>
          {/* Show details (attractions/restaurants) if expanded */}
          {expanded[city.name] && (
            <div className="city-details">
              {/* Pass city-specific handlers and data to AttractionList */}
              <AttractionList
                attractions={city.attractions || []}
                cityName={city.name}
                onAdd={a => onAddAttraction(city.name, a)}
                onDelete={a => onDeleteAttraction(city.name, a)}
                loggedIn={loggedIn}
                error={error}
              />
              {/* Pass city-specific handlers and data to RestaurantList */}
              <RestaurantList
                restaurants={city.restaurants || []}
                cityName={city.name}
                onAdd={r => onAddRestaurant(city.name, r)}
                onDelete={r => onDeleteRestaurant(city.name, r)}
                loggedIn={loggedIn}
                error={error}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 