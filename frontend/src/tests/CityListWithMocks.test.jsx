/**
 * CityListWithMocks.test.jsx
 *
 * This test suite demonstrates the use of vi.mock to mock child components
 * and external dependencies. This is useful for knowledge sharing sessions
 * to show how to isolate components and test them in isolation.
 *
 * Coverage includes:
 * - Mocking child components (AttractionList, RestaurantList)
 * - Testing component behavior with mocked dependencies
 * - Verifying component interactions with mocked children
 * - Testing prop passing to mocked components
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CityList from '../CityList';

// Mock the AttractionList component
vi.mock('../AttractionList', () => ({
  default: vi.fn(({ attractions, onAdd, onDelete, error }) => (
    <div data-testid="attraction-list">
      <h4>Attractions</h4>
      {error && <div data-testid="attraction-error">{error}</div>}
      {attractions.map((attraction, index) => (
        <div key={index} data-testid={`attraction-${index}`}>
          {attraction}
          <button 
            data-testid={`delete-attraction-${index}`}
            onClick={() => onDelete(attraction)}
          >
            Delete
          </button>
        </div>
      ))}
      <button 
        data-testid="add-attraction"
        onClick={() => onAdd('New Attraction')}
      >
        Add Attraction
      </button>
    </div>
  ))
}));

// Mock the RestaurantList component
vi.mock('../RestaurantList', () => ({
  default: vi.fn(({ restaurants, onAdd, onDelete, error }) => (
    <div data-testid="restaurant-list">
      <h4>Restaurants</h4>
      {error && <div data-testid="restaurant-error">{error}</div>}
      {restaurants.map((restaurant, index) => (
        <div key={index} data-testid={`restaurant-${index}`}>
          {restaurant}
          <button 
            data-testid={`delete-restaurant-${index}`}
            onClick={() => onDelete(restaurant)}
          >
            Delete
          </button>
        </div>
      ))}
      <button 
        data-testid="add-restaurant"
        onClick={() => onAdd('New Restaurant')}
      >
        Add Restaurant
      </button>
    </div>
  ))
}));

// Import the mocked components to access their mock functions
import AttractionList from '../AttractionList';
import RestaurantList from '../RestaurantList';

describe('CityList Component with Mocked Dependencies', () => {
  const sampleCities = [
    { name: 'Paris', attractions: ['Eiffel Tower', 'Louvre'], restaurants: ['Le Meurice', 'L\'Astrance'] },
    { name: 'London', attractions: ['Big Ben'], restaurants: ['The Ritz'] }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('Mocked Child Components', () => {
    it('should render mocked AttractionList and RestaurantList components', () => {
      render(<CityList cities={sampleCities} loggedIn={true} />);

      // Expand the first city to show the mocked components
      const expandButtons = screen.getAllByText('Expand');
      fireEvent.click(expandButtons[0]);

      // Verify mocked components are rendered
      expect(screen.getByTestId('attraction-list')).toBeInTheDocument();
      expect(screen.getByTestId('restaurant-list')).toBeInTheDocument();
      
      // Verify AttractionList was called with correct props
      expect(AttractionList).toHaveBeenCalledWith(
        expect.objectContaining({
          attractions: ['Eiffel Tower', 'Louvre'],
          cityName: 'Paris',
          loggedIn: true,
          error: undefined
        }),
        undefined
      );

      // Verify RestaurantList was called with correct props
      expect(RestaurantList).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurants: ['Le Meurice', 'L\'Astrance'],
          cityName: 'Paris',
          loggedIn: true,
          error: undefined
        }),
        undefined
      );
    });

    it('should pass error prop to mocked child components', () => {
      const errorMessage = 'City limit reached!';
      render(<CityList cities={sampleCities} error={errorMessage} loggedIn={true} />);

      // Expand city details to show child components
      fireEvent.click(screen.getAllByText(/expand/i)[0]);

      // Verify error is passed to child components
      expect(screen.getByTestId('attraction-error')).toHaveTextContent(errorMessage);
      expect(screen.getByTestId('restaurant-error')).toHaveTextContent(errorMessage);

      // Verify AttractionList was called with error prop
      expect(AttractionList).toHaveBeenCalledWith(
        expect.objectContaining({
          error: errorMessage,
          cityName: 'Paris',
          loggedIn: true
        }),
        undefined
      );

      // Verify RestaurantList was called with error prop
      expect(RestaurantList).toHaveBeenCalledWith(
        expect.objectContaining({
          error: errorMessage,
          cityName: 'Paris',
          loggedIn: true
        }),
        undefined
      );
    });

    it('should handle interactions with mocked child components', () => {
      const onAddAttraction = vi.fn();
      const onDeleteAttraction = vi.fn();
      const onAddRestaurant = vi.fn();
      const onDeleteRestaurant = vi.fn();

      render(
        <CityList 
          cities={sampleCities} 
          loggedIn={true}
          onAddAttraction={onAddAttraction}
          onDeleteAttraction={onDeleteAttraction}
          onAddRestaurant={onAddRestaurant}
          onDeleteRestaurant={onDeleteRestaurant}
        />
      );

      // Expand city details
      fireEvent.click(screen.getAllByText(/expand/i)[0]);

      // Test attraction interactions
      fireEvent.click(screen.getByTestId('add-attraction'));
      expect(onAddAttraction).toHaveBeenCalledWith('Paris', 'New Attraction');

      fireEvent.click(screen.getByTestId('delete-attraction-0'));
      expect(onDeleteAttraction).toHaveBeenCalledWith('Paris', 'Eiffel Tower');

      // Test restaurant interactions
      fireEvent.click(screen.getByTestId('add-restaurant'));
      expect(onAddRestaurant).toHaveBeenCalledWith('Paris', 'New Restaurant');

      fireEvent.click(screen.getByTestId('delete-restaurant-0'));
      expect(onDeleteRestaurant).toHaveBeenCalledWith('Paris', 'Le Meurice');
    });
  });

  describe('Component Behavior with Mocked Dependencies', () => {
    it('should handle city operations with mocked children', () => {
      const onAddCity = vi.fn();
      const onUpdateCity = vi.fn();
      const onDeleteCity = vi.fn();

      render(
        <CityList 
          cities={sampleCities} 
          loggedIn={true}
          onAddCity={onAddCity}
          onUpdateCity={onUpdateCity}
          onDeleteCity={onDeleteCity}
        />
      );

      // Test city operations
      fireEvent.click(screen.getByText(/add city/i));
      expect(onAddCity).toHaveBeenCalled();

      fireEvent.click(screen.getAllByText(/edit/i)[0]);
      expect(onUpdateCity).toHaveBeenCalledWith(sampleCities[0]);

      fireEvent.click(screen.getAllByText(/delete/i)[0]);
      expect(onDeleteCity).toHaveBeenCalledWith('Paris');
    });

    it('should handle multiple cities with mocked child components', () => {
      const manyCities = [
        { name: 'Paris', attractions: ['A1', 'A2'], restaurants: ['R1', 'R2'] },
        { name: 'London', attractions: ['A3'], restaurants: ['R3'] },
        { name: 'Tokyo', attractions: ['A4', 'A5', 'A6'], restaurants: ['R4'] }
      ];

      render(<CityList cities={manyCities} loggedIn={true} />);

      // Verify all cities are rendered
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Tokyo')).toBeInTheDocument();

      // Expand all cities
      const expandButtons = screen.getAllByText(/expand/i);
      expandButtons.forEach(button => fireEvent.click(button));

      // Verify all child components are rendered
      const attractionLists = screen.getAllByTestId('attraction-list');
      const restaurantLists = screen.getAllByTestId('restaurant-list');
      
      expect(attractionLists).toHaveLength(3);
      expect(restaurantLists).toHaveLength(3);

      // Verify AttractionList was called for each expanded city
      expect(AttractionList).toHaveBeenCalledTimes(6); // All three cities are expanded (2 calls each)
      expect(RestaurantList).toHaveBeenCalledTimes(6); // All three cities are expanded (2 calls each)
    });
  });

  describe('Mock Verification and Assertions', () => {
    it('should verify mock function calls with specific arguments', () => {
      render(<CityList cities={sampleCities} loggedIn={true} />);

      // Expand city details first
      fireEvent.click(screen.getAllByText(/expand/i)[0]);

      // Verify AttractionList was called with specific attractions
      expect(AttractionList).toHaveBeenCalledWith(
        expect.objectContaining({
          attractions: ['Eiffel Tower', 'Louvre'],
          cityName: 'Paris',
          loggedIn: true,
          error: undefined
        }),
        undefined
      );

      // Verify RestaurantList was called with specific restaurants
      expect(RestaurantList).toHaveBeenCalledWith(
        expect.objectContaining({
          restaurants: ['Le Meurice', 'L\'Astrance'],
          cityName: 'Paris',
          loggedIn: true,
          error: undefined
        }),
        undefined
      );
    });

    it('should verify mock function call counts', () => {
      render(<CityList cities={sampleCities} loggedIn={true} />);

      // Expand all cities to trigger component calls
      const expandButtons = screen.getAllByText(/expand/i);
      expandButtons.forEach(button => fireEvent.click(button));

      // Verify each mocked component was called once per city
      expect(AttractionList).toHaveBeenCalledTimes(3); // One for each city
      expect(RestaurantList).toHaveBeenCalledTimes(3); // One for each city
    });

    it('should verify mock function call order', () => {
      render(<CityList cities={sampleCities} loggedIn={true} />);

      // Expand all cities to trigger component calls
      const expandButtons = screen.getAllByText(/expand/i);
      expandButtons.forEach(button => fireEvent.click(button));

      // Get all calls to verify order
      const attractionCalls = AttractionList.mock.calls;
      const restaurantCalls = RestaurantList.mock.calls;

      // Verify first city's components were called first
      expect(attractionCalls[0][0].attractions).toEqual(['Eiffel Tower', 'Louvre']);
      expect(restaurantCalls[0][0].restaurants).toEqual(['Le Meurice', 'L\'Astrance']);

      // Verify second city's components were called second
      expect(attractionCalls[1][0].attractions).toEqual(['Eiffel Tower', 'Louvre']);
      expect(restaurantCalls[1][0].restaurants).toEqual(['Le Meurice', 'L\'Astrance']);
    });
  });

  describe('Error Scenarios with Mocked Dependencies', () => {
    it('should handle mocked component errors gracefully', () => {
      // Mock AttractionList to throw an error
      AttractionList.mockImplementation(() => {
        throw new Error('AttractionList error');
      });

      // Component should still render even with child component errors
      render(<CityList cities={sampleCities} loggedIn={true} />);
      
      expect(screen.getByText('Paris')).toBeInTheDocument();
      expect(screen.getByText('London')).toBeInTheDocument();
    });
  });
}); 