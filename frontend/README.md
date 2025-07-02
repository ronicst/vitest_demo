# Frontend for Demo Microservices

## Overview
This is a modern React frontend built with Vite for the Demo Microservices project. It provides a user-friendly interface for registration, login, and managing favorite cities, attractions, and restaurants.

## Features
- User registration and login with email validation
- Custom error messages for invalid email, invalid credentials, and limit violations
- Add, update, and delete cities (max 10 per user)
- Add and remove attractions and restaurants for each city (max 5 each per city)
- Expand/collapse city details
- Responsive, modern UI with button alignment, text wrapping, and clear feedback
- Add fields are only visible when under the respective limits
- All error and validation messages are clearly displayed

## File Structure
```
frontend/
  src/
    App.jsx            # Main app logic
    CityList.jsx       # City list and expand/collapse
    AttractionList.jsx # Attractions management
    RestaurantList.jsx # Restaurants management
    LoginForm.jsx      # Login/registration form with validation
    assets/            # Static assets
    tests/             # Unit tests (Vitest + Testing Library)
    App.css            # Main styles
  public/              # Static assets
  package.json         # Dependencies and scripts
  vite.config.js       # Vite configuration
```

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend runs on `http://localhost:5173` by default.

## Testing
- Run all frontend tests with:
  ```bash
  npm test
  ```
- Tests are located in `src/tests/` and use [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).
- Tests cover:
  - UI/UX for login, registration, city/attraction/restaurant management
  - Email validation and error messages
  - Backend error display (e.g., invalid credentials)
  - Add field visibility based on limits
  - Button alignment, text wrapping, and expand/collapse
  - Clearing of fields and errors when toggling between login/register

## Notes
- The frontend expects the backend to be running at `http://localhost:3001`.
- For demo purposes, authentication and data storage are simplified.
- For production, use HTTPS and secure session management.

---

For more details, see comments in each source and test file.
