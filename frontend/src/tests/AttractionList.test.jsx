/**
 * AttractionList.test.jsx
 *
 * This test suite verifies the AttractionList component, which displays a list of attractions for a city,
 * allows adding and removing attractions (with a limit of 5), and handles error and UI states.
 *
 * Coverage includes:
 * - Rendering of attractions
 * - Conditional rendering of the add form (based on login state and attraction count)
 * - Add and remove functionality (event handlers)
 * - Error message display
 * - UI/UX details (wrapping long names, button alignment)
 * - Enforcement of the 5-attraction limit
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AttractionList from '../AttractionList';

// Group all AttractionList tests
// This describe block covers all behaviors and edge cases for the AttractionList component

describe('AttractionList', () => {
  const attractions = ['Eiffel Tower', 'Louvre'];

  // Test: Rendering of provided attractions
  it('renders attractions', () => {
    render(<AttractionList attractions={attractions} loggedIn={false} />);
    expect(screen.getAllByText('Eiffel Tower')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Louvre')[0]).toBeInTheDocument();
  });

  // Test: Add form is shown if user is logged in and there are less than 5 attractions
  it('shows add form if logged in and less than 5', () => {
    render(<AttractionList attractions={[]} loggedIn={true} onAdd={() => {}} />);
    expect(screen.getAllByPlaceholderText(/add attraction/i)[0]).toBeInTheDocument();
  });

  // Test: onAdd handler is called with correct value when form is submitted
  it('calls onAdd when form is submitted', () => {
    const onAdd = vi.fn();
    render(<AttractionList attractions={[]} loggedIn={true} onAdd={onAdd} />);
    fireEvent.change(screen.getAllByPlaceholderText(/add attraction/i)[0], { target: { value: 'Arc de Triomphe' } });
    fireEvent.click(screen.getAllByText(/add/i)[0]);
    expect(onAdd).toHaveBeenCalledWith('Arc de Triomphe');
  });

  // Test: onDelete handler is called with correct value when remove is clicked
  it('calls onDelete when remove is clicked', () => {
    const onDelete = vi.fn();
    render(<AttractionList attractions={['Eiffel Tower']} loggedIn={true} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText(/remove/i)[0]);
    expect(onDelete).toHaveBeenCalledWith('Eiffel Tower');
  });

  // Test: Error message is displayed if error prop is set
  it('shows error message if error prop is set', () => {
    render(<AttractionList attractions={[]} error="Attraction limit reached!" loggedIn={true} />);
    expect(screen.getByText(/attraction limit reached/i)).toBeInTheDocument();
  });

  // Test: Long attraction names are wrapped and remove button is aligned left
  it('wraps long attraction names and aligns remove button left', () => {
    const longName = 'A very very very very long attraction name';
    render(<AttractionList attractions={[longName]} loggedIn={true} onDelete={() => {}} />);
    const nameSpan = screen.getByText(longName);
    expect(nameSpan).toHaveClass('wrap-name');
    const removeBtn = screen.getByText(/remove/i);
    expect(removeBtn).toHaveClass('remove-btn');
    expect(nameSpan.closest('div')).toHaveClass('attraction-row');
  });

  // Test: Add Attraction form is hidden when there are 5 attractions
  it('hides Add Attraction form when there are 5 attractions', () => {
    const attractions = Array.from({length: 5}, (_, i) => `Attraction${i}`);
    render(<AttractionList attractions={attractions} loggedIn={true} onAdd={() => {}} />);
    expect(screen.queryByPlaceholderText(/add attraction/i)).not.toBeInTheDocument();
  });

  // Test: Add Attraction form is shown when there are less than 5 attractions
  it('shows Add Attraction form when there are less than 5 attractions', () => {
    const attractions = Array.from({length: 4}, (_, i) => `Attraction${i}`);
    render(<AttractionList attractions={attractions} loggedIn={true} onAdd={() => {}} />);
    expect(screen.getByPlaceholderText(/add attraction/i)).toBeInTheDocument();
  });
}); 