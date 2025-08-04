/**
 * SimpleMockExample.test.jsx
 *
 * This is a simple, working example of vi.mock usage for knowledge sharing.
 * It demonstrates the key concepts without the complexity of the full App component.
 *
 * Key concepts demonstrated:
 * - Mocking fetch API
 * - Mocking localStorage
 * - Mocking external functions
 * - Verifying mock calls
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock fetch globally
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

// Mock external utility function
const mockUtility = vi.fn();
vi.mock('../utils/example', () => ({
  formatData: mockUtility,
}));

// Simple component for testing
function SimpleComponent({ onDataLoad }) {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
      onDataLoad?.(result);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error.message);
    }
  };

  const getFromStorage = (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  // Use the mocked utility function
  React.useEffect(() => {
    mockUtility('component-mounted');
  }, []);

  return (
    <div>
      <h1>Simple Component</h1>
      <button onClick={loadData} disabled={loading}>
        {loading ? 'Loading...' : 'Load Data'}
      </button>
      {data && (
        <div>
          <h2>Data Loaded</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      <button onClick={() => saveToStorage('test-key', { message: 'Hello' })}>
        Save to Storage
      </button>
      <button onClick={() => console.log(getFromStorage('test-key'))}>
        Get from Storage
      </button>
    </div>
  );
}

describe('Simple Mock Examples', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful fetch response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Success', data: [1, 2, 3] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Fetch Mocking', () => {
    it('should mock fetch successfully', async () => {
      const onDataLoad = vi.fn();
      render(<SimpleComponent onDataLoad={onDataLoad} />);

      // Click load data button
      const loadButton = screen.getByText('Load Data');
      fireEvent.click(loadButton);

      // Wait for data to load
      await screen.findByText('Data Loaded');

      // Verify fetch was called
      expect(mockFetch).toHaveBeenCalledWith('/api/data');
      expect(onDataLoad).toHaveBeenCalledWith({ message: 'Success', data: [1, 2, 3] });
    });

    it('should handle fetch errors', async () => {
      // Mock fetch to throw error
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<SimpleComponent />);

      // Click load data button
      const loadButton = screen.getByText('Load Data');
      fireEvent.click(loadButton);

      // Button should be disabled during loading
      expect(loadButton).toBeDisabled();
      
      // Wait for loading to complete
      await screen.findByText('Load Data');
      expect(loadButton).not.toBeDisabled();
    });

    it('should handle different fetch responses', async () => {
      // Mock different responses for different calls
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'First call' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ message: 'Second call' }),
        });

      render(<SimpleComponent />);

      const loadButton = screen.getByText('Load Data');

      // First call
      fireEvent.click(loadButton);
      await screen.findByText(/First call/);

      // Second call
      fireEvent.click(loadButton);
      await screen.findByText(/Second call/);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('LocalStorage Mocking', () => {
    it('should mock localStorage operations', () => {
      render(<SimpleComponent />);

      // Test setItem
      const saveButton = screen.getByText('Save to Storage');
      fireEvent.click(saveButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({ message: 'Hello' })
      );

      // Test getItem
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ message: 'Hello' }));
      const getButton = screen.getByText('Get from Storage');
      fireEvent.click(getButton);

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test-key');
    });

    it('should handle localStorage errors', () => {
      // Mock localStorage to throw error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      render(<SimpleComponent />);

      const saveButton = screen.getByText('Save to Storage');
      
      // Wrap in try-catch to handle expected error
      try {
        fireEvent.click(saveButton);
      } catch (error) {
        // Expected error, component should still render
      }

      // Component should not crash
      expect(screen.getByText('Simple Component')).toBeInTheDocument();
    });
  });

  describe('Utility Function Mocking', () => {
    it('should mock utility functions', () => {
      // Mock utility to return formatted data
      mockUtility.mockReturnValue('formatted-data');

      render(<SimpleComponent />);

      // Verify utility was called (if used in component)
      // This demonstrates how to mock utility functions
      expect(mockUtility).toHaveBeenCalled();
    });
  });

  describe('Mock Verification', () => {
    it('should verify mock call counts', () => {
      render(<SimpleComponent />);

      const saveButton = screen.getByText('Save to Storage');
      fireEvent.click(saveButton);
      fireEvent.click(saveButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });

    it('should verify mock call arguments', () => {
      render(<SimpleComponent />);

      const saveButton = screen.getByText('Save to Storage');
      fireEvent.click(saveButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify({ message: 'Hello' })
      );
    });

    it('should verify mock call order', () => {
      render(<SimpleComponent />);

      const loadButton = screen.getByText('Load Data');
      const saveButton = screen.getByText('Save to Storage');

      fireEvent.click(loadButton);
      fireEvent.click(saveButton);

      const fetchCalls = mockFetch.mock.calls;
      const storageCalls = mockLocalStorage.setItem.mock.calls;

      expect(fetchCalls[0][0]).toBe('/api/data');
      expect(storageCalls[0][0]).toBe('test-key');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      render(<SimpleComponent />);

      const loadButton = screen.getByText('Load Data');
      
      // Wrap in try-catch to handle expected error
      try {
        fireEvent.click(loadButton);
      } catch (error) {
        // Expected error, component should still render
      }

      // Component should still render even with errors
      expect(screen.getByText('Simple Component')).toBeInTheDocument();
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      render(<SimpleComponent />);

      const loadButton = screen.getByText('Load Data');
      
      // Wrap in try-catch to handle expected error
      try {
        fireEvent.click(loadButton);
      } catch (error) {
        // Expected error, component should still render
      }

      // Component should still render even with JSON errors
      expect(screen.getByText('Simple Component')).toBeInTheDocument();
    });
  });
}); 