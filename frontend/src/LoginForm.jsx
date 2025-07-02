// LoginForm.jsx
// Handles user login and registration with email validation, error display, and mode toggling. Clears fields and errors on toggle.

import React from 'react';
import { useState } from 'react';

export default function LoginForm({ onAuth, error, onToggleMode }) {
  // State for form mode, input fields, and local error
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  // Validate email format
  function isValidEmail(email) {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  }

  // Handle form submit: validate email, then call onAuth
  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!isValidEmail(username)) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    onAuth(mode, { username, password });
  };

  return (
    <div className="login-form bright-card">
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      {/* Login/register form fields */}
      <form className="login-form-fields" onSubmit={handleSubmit} data-testid="login-form">
        <input
          className="login-input"
          type="text"
          placeholder="Username (email)"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          className="login-input"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button className="login-btn" type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>
      {/* Toggle between login and register, clearing fields and errors */}
      <button
        className="toggle-btn"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setLocalError('');
          setUsername('');
          setPassword('');
          if (typeof onToggleMode === 'function') onToggleMode();
        }}
      >
        {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
      </button>
      {/* Show local or backend error message if present */}
      {(localError || error) && <div className="error-msg">{localError || error}</div>}
    </div>
  );
} 