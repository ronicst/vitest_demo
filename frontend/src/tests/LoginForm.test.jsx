/**
 * LoginForm.test.jsx
 *
 * This test suite verifies the LoginForm component, which provides login and registration forms, handles email validation,
 * toggling between modes, error display, and clearing of fields and errors. It ensures robust authentication UI/UX.
 *
 * Coverage includes:
 * - Rendering of login and register forms
 * - Toggling between login and register modes
 * - Email validation and prevention of invalid submissions
 * - onAuth handler invocation with correct data
 * - Display and clearing of backend and validation errors
 * - Field clearing and error reset on mode toggle
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../LoginForm';

// Group all LoginForm tests
// This describe block covers all behaviors and edge cases for the LoginForm component

describe('LoginForm', () => {
  // Test: Login form is rendered by default
  it('renders login form by default', () => {
    render(<LoginForm onAuth={() => {}} />);
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/username/i)[0]).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText(/password/i)[0]).toBeInTheDocument();
  });

  // Test: Toggling to register mode
  it('toggles to register mode', () => {
    render(<LoginForm onAuth={() => {}} />);
    fireEvent.click(screen.getAllByText(/need an account/i)[0]);
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
  });

  // Test: onAuth handler is called with correct data on login
  it('calls onAuth with correct data', () => {
    const onAuth = vi.fn();
    render(<LoginForm onAuth={onAuth} />);
    fireEvent.change(screen.getAllByPlaceholderText(/username/i)[0], { target: { value: 'alice@example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'pw' } });
    fireEvent.submit(screen.getByTestId('login-form'));
    expect(onAuth).toHaveBeenCalledWith('login', { username: 'alice@example.com', password: 'pw' });
  });

  // Test: Shows error for invalid email and does not call onAuth
  it('shows error for invalid email and does not call onAuth', () => {
    const onAuth = vi.fn();
    render(<LoginForm onAuth={onAuth} />);
    fireEvent.change(screen.getAllByPlaceholderText(/username/i)[0], { target: { value: 'notanemail' } });
    fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'pw' } });
    fireEvent.submit(screen.getByTestId('login-form'));
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(onAuth).not.toHaveBeenCalled();
  });

  // Test: Shows backend error if provided
  it('shows backend error if provided', () => {
    render(<LoginForm onAuth={() => {}} error="Backend error!" />);
    expect(screen.getByText(/backend error/i)).toBeInTheDocument();
  });

  // Test: Shows backend error for invalid credentials
  it('shows backend error for invalid credentials', () => {
    render(<LoginForm onAuth={() => {}} error="Invalid credentials" />);
    expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
  });

  // Helper: Wrapper to test error clearing and field reset
  function WrapperWithError() {
    const [error, setError] = React.useState('Some error');
    return <LoginForm onAuth={() => {}} error={error} onToggleMode={() => setError('')} />;
  }

  // Test: Clears fields and errors when toggling to register
  it('clears fields and errors when toggling to register', () => {
    render(<WrapperWithError />);
    // Fill fields and show error
    fireEvent.change(screen.getAllByPlaceholderText(/username/i)[0], { target: { value: 'notanemail' } });
    fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'pw' } });
    // Simulate error by submitting invalid email
    fireEvent.submit(screen.getByTestId('login-form'));
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    // Toggle to register
    fireEvent.click(screen.getByText(/need an account/i));
    // Fields should be empty
    expect(screen.getAllByPlaceholderText(/username/i)[0].value).toBe('');
    expect(screen.getAllByPlaceholderText(/password/i)[0].value).toBe('');
    // Error should be gone
    expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/some error/i)).not.toBeInTheDocument();
  });

  // Test: Clears fields and errors when toggling to login
  it('clears fields and errors when toggling to login', () => {
    render(<WrapperWithError />);
    // Switch to register
    fireEvent.click(screen.getByText(/need an account/i));
    // Fill fields and show error
    fireEvent.change(screen.getAllByPlaceholderText(/username/i)[0], { target: { value: 'notanemail' } });
    fireEvent.change(screen.getAllByPlaceholderText(/password/i)[0], { target: { value: 'pw' } });
    fireEvent.submit(screen.getByTestId('login-form'));
    expect(screen.getAllByPlaceholderText(/username/i)[0].value).toBe('notanemail');
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    // Toggle to login
    fireEvent.click(screen.getByText(/already have an account/i));
    // Fields should be empty
    expect(screen.getAllByPlaceholderText(/username/i)[0].value).toBe('');
    expect(screen.getAllByPlaceholderText(/password/i)[0].value).toBe('');
    // Error should be gone
    expect(screen.queryByText(/valid email/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/some error/i)).not.toBeInTheDocument();
  });
}); 