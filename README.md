# Demo Microservices Project

This project is a full-stack demo application featuring a React frontend and a Node.js/Express backend. It allows users to register, log in, and manage their favorite cities, attractions, and restaurants. The backend uses JSON files for data storage, and the frontend is built with Vite and React.

---

## Table of Contents
- [Features](#features)
- [Project Structure](#project-structure)
- [Environment Setup](#environment-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Notes](#notes)

---

## Features
- User registration, login, and logout with email validation
- Add, update, and delete cities (max 10 per user)
- Add and remove attractions and restaurants for each city (max 5 each per city)
- Persistent data storage using JSON files (for demo purposes)
- Custom error messages for invalid email, invalid credentials, and limit violations
- Modern, responsive UI with robust UX (expand/collapse, button alignment, text wrapping)
- Full unit test coverage for both backend and frontend, including validation and error handling

---

## Project Structure
```
demo-microservices/
  backend/
    src/           # Backend source code (Express routes, server setup)
    tests/         # Backend tests (Vitest)
    data.json      # City data storage
    users.json     # User data storage
    package.json   # Backend dependencies and scripts
    README.md      # Backend-specific documentation
  frontend/
    src/           # Frontend source code (React components)
      tests/       # Frontend tests (Vitest + Testing Library)
    public/        # Static assets
    package.json   # Frontend dependencies and scripts
    vite.config.js # Vite configuration
    README.md      # Frontend-specific documentation
```

---

## Environment Setup

1. **Install Node.js** (v18+ recommended)
   - Download from [nodejs.org](https://nodejs.org/)
2. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Demo/demo-microservices
   ```

---

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   node src/server.js
   ```
   - The backend runs on `http://localhost:3001` by default.
   - API endpoints are available under `/api/users` and `/api/cities`.

---

## Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   - The frontend runs on `http://localhost:5173` by default (Vite).
   - The frontend expects the backend to be running at `http://localhost:3001`.

---

## Running the Application

- Start the backend first, then the frontend.
- Open your browser at [http://localhost:5173](http://localhost:5173) to use the app.
- Register a new user, log in, and start managing your favorite cities, attractions, and restaurants.

---

## Testing

### Backend
- From the `backend` directory, run:
  ```bash
  npm test
  ```
- Tests are located in `backend/tests/` and use [Vitest](https://vitest.dev/).
- Each test resets the data files to ensure isolation.
- Tests cover:
  - User registration, login, logout, and session
  - Email validation and error messages
  - City, attraction, and restaurant CRUD with limit enforcement
  - Error handling for all endpoints

### Frontend
- From the `frontend` directory, run:
  ```bash
  npm test
  ```
- Tests are located in `frontend/src/tests/` and use [Vitest](https://vitest.dev/) and [Testing Library](https://testing-library.com/).
- The test environment is set to `jsdom` for browser-like testing.
- Tests cover:
  - UI/UX for login, registration, city/attraction/restaurant management
  - Email validation and error messages
  - Backend error display (e.g., invalid credentials)
  - Add field visibility based on limits
  - Button alignment, text wrapping, and expand/collapse

---

## Notes
- Data is stored in `backend/data.json` and `backend/users.json`.
- For demo purposes, authentication and data storage are simplified.
- For production, use a real database and secure session management.
- See the `README.md` files in each subdirectory for more details on backend and frontend implementation.

---

Enjoy exploring and extending this demo microservices project! 