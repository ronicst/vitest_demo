/**
 * CityList.test.jsx
 *
 * This test suite verifies the CityList component, which displays a list of cities, allows adding, editing, deleting cities,
 * expanding/collapsing city details, and handles error and UI states. It also enforces the 10-city limit and passes errors to child components.
 *
 * Coverage includes:
 * - Rendering of city names
 * - Add, delete, and update city functionality
 * - Expand/collapse logic for city details
 * - Button class and alignment
 * - Error message display and propagation
 * - UI/UX details (wrapping long names, button alignment)
 * - Enforcement of the 10-city limit
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CityList from '../CityList';

// Group all CityList tests
// This describe block covers all behaviors and edge cases for the CityList component

describe('CityList', () => {
  const sampleCities = [
    { name: 'Paris', attractions: ['Eiffel Tower'], restaurants: ['Le Meurice'] },
    { name: 'London', attractions: [], restaurants: [] }
  ];

  // Test: Rendering of provided city names
  it('renders city names', () => {
    render(<CityList cities={sampleCities} loggedIn={false} />);
    expect(screen.getAllByText('Paris')[0]).toBeInTheDocument();
    expect(screen.getAllByText('London')[0]).toBeInTheDocument();
  });

  // Test: onAddCity handler is called when Add City button is clicked
  it('calls onAddCity when add button is clicked', () => {
    const onAddCity = vi.fn();
    render(<CityList cities={[]} onAddCity={onAddCity} loggedIn={true} />);
    fireEvent.click(screen.getByText(/add city/i));
    expect(onAddCity).toHaveBeenCalled();
  });

  // Test: onDeleteCity handler is called with correct city name when Delete is clicked
  it('calls onDeleteCity when delete button is clicked', () => {
    const onDeleteCity = vi.fn();
    render(<CityList cities={sampleCities} onDeleteCity={onDeleteCity} loggedIn={true} />);
    fireEvent.click(screen.getAllByText(/delete/i)[0]);
    expect(onDeleteCity).toHaveBeenCalledWith('Paris');
  });

  // Test: Expand/collapse logic for city details
  it('expands and collapses city details', () => {
    render(<CityList cities={sampleCities} loggedIn={true} />);
    // Initially, details are not shown
    expect(screen.queryByText('Attractions')).not.toBeInTheDocument();
    // Expand Paris
    fireEvent.click(screen.getAllByText(/expand/i)[0]);
    expect(screen.getByText('Attractions')).toBeInTheDocument();
    expect(screen.getByText('Restaurants')).toBeInTheDocument();
    // Collapse Paris
    fireEvent.click(screen.getAllByText(/collapse/i)[0]);
    expect(screen.queryByText('Attractions')).not.toBeInTheDocument();
  });

  // Test: Expand/collapse button has correct className
  it('expand/collapse button has correct className', () => {
    render(<CityList cities={sampleCities} loggedIn={true} />);
    const expandBtn = screen.getAllByRole('button', { name: /expand/i })[0];
    expect(expandBtn).toHaveClass('expand-btn');
    fireEvent.click(expandBtn);
    const collapseBtn = screen.getAllByRole('button', { name: /collapse/i })[0];
    expect(collapseBtn).toHaveClass('expand-btn');
  });

  // Test: Error message is displayed if error prop is set
  it('shows error message if error prop is set', () => {
    render(<CityList cities={[]} error="City limit reached!" loggedIn={true} />);
    expect(screen.getByText(/city limit reached/i)).toBeInTheDocument();
  });

  // Test: Error is passed to child AttractionList and RestaurantList components
  it('passes error to AttractionList and RestaurantList', () => {
    const sampleCities = [
      { name: 'Paris', attractions: ['Eiffel Tower'], restaurants: ['Le Meurice'] }
    ];
    render(<CityList cities={sampleCities} error="Attraction limit!" loggedIn={true} onAddAttraction={() => {}} onDeleteAttraction={() => {}} onAddRestaurant={() => {}} onDeleteRestaurant={() => {}} onUpdateCity={() => {}} onDeleteCity={() => {}} onAddCity={() => {}} />);
    fireEvent.click(screen.getAllByText(/expand/i)[0]);
    // Should appear 3 times: top, AttractionList, RestaurantList
    expect(screen.getAllByText(/attraction limit/i)).toHaveLength(3);
  });

  // Test: Long city names are wrapped and buttons are aligned left
  it('wraps long city names and aligns buttons left', () => {
    const longName = 'A very very very very long city name that should wrap';
    render(<CityList cities={[{ name: longName, attractions: [], restaurants: [] }]} loggedIn={true} onUpdateCity={() => {}} onDeleteCity={() => {}} onAddAttraction={() => {}} onDeleteAttraction={() => {}} onAddRestaurant={() => {}} onDeleteRestaurant={() => {}} onAddCity={() => {}} />);
    const nameH3 = screen.getByText(longName);
    expect(nameH3).toHaveClass('wrap-name');
    // Check for button classes
    expect(screen.getByRole('button', { name: /edit/i })).toHaveClass('edit-btn');
    expect(screen.getByRole('button', { name: /delete/i })).toHaveClass('delete-btn');
    expect(screen.getByRole('button', { name: /expand/i })).toHaveClass('expand-btn');
  });

  // Test: Add City button is hidden when there are 10 cities
  it('hides Add City button when there are 10 cities', () => {
    const cities = Array.from({length: 10}, (_, i) => ({ name: `City${i}`, attractions: [], restaurants: [] }));
    render(<CityList cities={cities} loggedIn={true} onAddCity={() => {}} />);
    expect(screen.queryByText(/add city/i)).not.toBeInTheDocument();
  });

  // Test: Add City button is shown when there are less than 10 cities
  it('shows Add City button when there are less than 10 cities', () => {
    const cities = Array.from({length: 9}, (_, i) => ({ name: `City${i}`, attractions: [], restaurants: [] }));
    render(<CityList cities={cities} loggedIn={true} onAddCity={() => {}} />);
    expect(screen.getByText(/add city/i)).toBeInTheDocument();
  });
}); 