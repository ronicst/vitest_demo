# Backend Service for Demo Microservices

## Overview
This backend provides user authentication and city management for a travel app. Users can register, log in, and manage their favorite cities, attractions, and restaurants. Data is stored in JSON files for simplicity.

## Tech Stack
- Node.js
- Express
- express-session
- cookie-parser
- cors
- Vitest (for testing)

## Features
- User registration, login, and logout with email validation
- Custom error messages for invalid email, invalid credentials, and limit violations
- Add, update, and delete cities (max 10 per user)
- Add and remove attractions and restaurants for each city (max 5 each per city)
- Persistent data storage using JSON files (for demo purposes)
- Full unit test coverage for all endpoints and validation logic

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   node src/server.js
   ```
   The server runs on `http://localhost:3001` by default.

## File Structure
```
backend/
  src/
    server.js        # Main server setup and middleware
    user.js          # User authentication routes and logic
    city.js          # City, attraction, and restaurant routes and logic
  tests/
    user.test.js     # Tests for user routes
    city.test.js     # Tests for city routes
  data.json          # Stores city data
  users.json         # Stores user data
  package.json       # Project metadata and dependencies
```

## API Endpoints

### User Routes (`/api/users`)
- `POST /register` — Register a new user (with email validation)
- `POST /login` — Log in a user (returns error for invalid credentials)
- `POST /logout` — Log out the current user
- `GET /me` — Get the current logged-in user

### City Routes (`/api/cities`)
- `GET /` — Get cities for the logged-in user (or latest if not logged in)
- `POST /` — Add or update a city (requires login, max 10 cities)
- `DELETE /:cityName` — Delete a city (requires login)
- `POST /:cityName/attractions` — Add an attraction to a city (requires login, max 5 attractions)
- `DELETE /:cityName/attractions/:attraction` — Remove an attraction from a city (requires login)
- `POST /:cityName/restaurants` — Add a restaurant to a city (requires login, max 5 restaurants)
- `DELETE /:cityName/restaurants/:restaurant` — Remove a restaurant from a city (requires login)

## Error Handling
- Returns clear error messages for:
  - Invalid email format
  - Invalid credentials
  - Exceeding city, attraction, or restaurant limits
  - Missing or malformed data

## Testing
Run all backend tests with:
```bash
npm test
```
Tests are located in the `tests/` directory and use Vitest. Each test resets the data files to ensure isolation.
Tests cover:
- User registration, login, logout, and session
- Email validation and error messages
- City, attraction, and restaurant CRUD with limit enforcement
- Error handling for all endpoints

## Notes
- Data is stored in `data.json` and `users.json` in the backend directory.
- The backend is designed to work with the frontend at `http://localhost:5173` (Vite default).
- For production, consider using a real database and secure session management.

---

For more details, see comments in each source and test file. 