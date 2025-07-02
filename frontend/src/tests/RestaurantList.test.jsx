/**
 * RestaurantList.test.jsx
 *
 * This test suite verifies the RestaurantList component, which displays a list of restaurants for a city,
 * allows adding and removing restaurants (with a limit of 5), and handles error and UI states.
 *
 * Coverage includes:
 * - Rendering of restaurants
 * - Conditional rendering of the add form (based on login state and restaurant count)
 * - Add and remove functionality (event handlers)
 * - Error message display
 * - UI/UX details (wrapping long names, button alignment)
 * - Enforcement of the 5-restaurant limit
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RestaurantList from '../RestaurantList';

// Group all RestaurantList tests
// This describe block covers all behaviors and edge cases for the RestaurantList component

describe('RestaurantList', () => {
  const restaurants = ['Le Meurice', 'Epicure'];

  // Test: Rendering of provided restaurants
  it('renders restaurants', () => {
    render(<RestaurantList restaurants={restaurants} loggedIn={false} />);
    expect(screen.getAllByText('Le Meurice')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Epicure')[0]).toBeInTheDocument();
  });

  // Test: Add form is shown if user is logged in and there are less than 5 restaurants
  it('shows add form if logged in and less than 5', () => {
    render(<RestaurantList restaurants={[]} loggedIn={true} onAdd={() => {}} />);
    expect(screen.getAllByPlaceholderText(/add restaurant/i)[0]).toBeInTheDocument();
  });

  // Test: onAdd handler is called with correct value when form is submitted
  it('calls onAdd when form is submitted', () => {
    const onAdd = vi.fn();
    render(<RestaurantList restaurants={[]} loggedIn={true} onAdd={onAdd} />);
    fireEvent.change(screen.getAllByPlaceholderText(/add restaurant/i)[0], { target: { value: 'Chez Janou' } });
    fireEvent.click(screen.getAllByText(/add/i)[0]);
    expect(onAdd).toHaveBeenCalledWith('Chez Janou');
  });

  // Test: onDelete handler is called with correct value when remove is clicked
  it('calls onDelete when remove is clicked', () => {
    const onDelete = vi.fn();
    render(<RestaurantList restaurants={['Le Meurice']} loggedIn={true} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText(/remove/i)[0]);
    expect(onDelete).toHaveBeenCalledWith('Le Meurice');
  });

  // Test: Error message is displayed if error prop is set
  it('shows error message if error prop is set', () => {
    render(<RestaurantList restaurants={[]} error="Restaurant limit reached!" loggedIn={true} />);
    expect(screen.getByText(/restaurant limit reached/i)).toBeInTheDocument();
  });

  // Test: Long restaurant names are wrapped and remove button is aligned left
  it('wraps long restaurant names and aligns remove button left', () => {
    const longName = 'A very very very very long restaurant name';
    render(<RestaurantList restaurants={[longName]} loggedIn={true} onDelete={() => {}} />);
    const nameSpan = screen.getByText(longName);
    expect(nameSpan).toHaveClass('wrap-name');
    const removeBtn = screen.getByText(/remove/i);
    expect(removeBtn).toHaveClass('remove-btn');
    expect(nameSpan.closest('div')).toHaveClass('restaurant-row');
  });

  // Test: Add Restaurant form is hidden when there are 5 restaurants
  it('hides Add Restaurant form when there are 5 restaurants', () => {
    const restaurants = Array.from({length: 5}, (_, i) => `Restaurant${i}`);
    render(<RestaurantList restaurants={restaurants} loggedIn={true} onAdd={() => {}} />);
    expect(screen.queryByPlaceholderText(/add restaurant/i)).not.toBeInTheDocument();
  });

  // Test: Add Restaurant form is shown when there are less than 5 restaurants
  it('shows Add Restaurant form when there are less than 5 restaurants', () => {
    const restaurants = Array.from({length: 4}, (_, i) => `Restaurant${i}`);
    render(<RestaurantList restaurants={restaurants} loggedIn={true} onAdd={() => {}} />);
    expect(screen.getByPlaceholderText(/add restaurant/i)).toBeInTheDocument();
  });
}); 