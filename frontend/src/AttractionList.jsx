// AttractionList.jsx
// Displays and manages attractions for a city. Handles add/remove, error display, and enforces a limit of 5 attractions per city.

import React from 'react';
import { useState } from 'react';

/**
 * AttractionList Component
 *
 * Displays and manages a list of attractions for a city. Allows adding and removing attractions,
 * displays error messages, and enforces a limit of 5 attractions per city.
 *
 * Props:
 *   - attractions: array of attraction names
 *   - cityName: name of the city (for handler calls)
 *   - onAdd: function to add a new attraction
 *   - onDelete: function to delete an attraction
 *   - loggedIn: boolean, true if user is logged in
 *   - error: error message to display (for attraction actions)
 *
 * State:
 *   - newAttraction: string, value of the new attraction input field
 *
 * Returns:
 *   - Renders a list of attractions with remove buttons (if logged in)
 *   - Renders an add form if under the limit and logged in
 */
export default function AttractionList({ attractions, cityName, onAdd, onDelete, loggedIn, error }) {
  // State for new attraction input
  const [newAttraction, setNewAttraction] = useState('');
  return (
    <div className="attraction-list bright-section">
      <h4>Attractions</h4>
      {/* Show error message if present */}
      {error && <div className="error-msg">{error}</div>}
      {/* List of attractions with remove buttons (if logged in) */}
      <div>
        {(attractions || []).map(a => (
          <div key={a} className="attraction-row">
            {/* Display attraction name, wrapped for long names */}
            <span className="wrap-name">{a}</span>
            {/* Remove button, only if logged in */}
            {loggedIn && <button className="remove-btn" onClick={() => onDelete(a)}>Remove</button>}
          </div>
        ))}
      </div>
      {/* Add attraction form, only visible if under limit and logged in */}
      {loggedIn && attractions.length < 5 && (
        <form className="add-form" onSubmit={e => { e.preventDefault(); onAdd(newAttraction); setNewAttraction(''); }}>
          <input
            type="text"
            placeholder="Add attraction"
            value={newAttraction}
            onChange={e => setNewAttraction(e.target.value)}
          />
          <button type="submit">Add</button>
        </form>
      )}
    </div>
  );
} 