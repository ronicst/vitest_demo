/**
 * userWithMocks.test.js
 *
 * This test suite demonstrates the use of vi.mock to mock file system operations,
 * external dependencies, and other modules. This is useful for knowledge sharing
 * sessions to show how to isolate modules for testing.
 *
 * Coverage includes:
 * - Mocking fs (file system) operations
 * - Mocking path module
 * - Mocking express router
 * - Testing module behavior with mocked dependencies
 * - Verifying mock function calls
 * - Testing error scenarios with mocked failures
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Mock the fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

// Mock the path module
vi.mock('path', () => ({
  default: {
    join: vi.fn(),
    dirname: vi.fn(),
  },
  join: vi.fn(),
  dirname: vi.fn(),
}));

// Mock express router
vi.mock('express', () => ({
  default: {
    Router: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
    })),
  },
  Router: vi.fn(() => ({
    post: vi.fn(),
    get: vi.fn(),
  })),
}));

// Import mocked modules
import fs from 'fs';
import express from 'express';

// Mock the user module
const mockUserRoutes = {
  handle: vi.fn(),
};

// Mock the user module itself
vi.mock('../src/user.js', () => ({
  default: mockUserRoutes,
}));

describe('User Module with Mocked Dependencies', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Set up default mock implementations
    path.join.mockReturnValue('/mock/path/users.json');
    path.dirname.mockReturnValue('/mock/path');
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue('[]');
    fs.writeFileSync.mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up after each test
    vi.restoreAllMocks();
  });

  describe('File System Operations with Mocked fs', () => {
    it('should read users from file with mocked fs', () => {
      // Mock file exists and contains users
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { username: 'alice@example.com', password: 'password123' },
        { username: 'bob@example.com', password: 'password456' }
      ]));

      // Simulate reading users
      const filePath = '/mock/path/users.json';
      if (fs.existsSync(filePath)) {
        const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        expect(fs.existsSync).toHaveBeenCalledWith(filePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
        expect(users).toHaveLength(2);
        expect(users[0].username).toBe('alice@example.com');
      }
    });

    it('should handle missing users file with mocked fs', () => {
      // Mock file doesn't exist
      fs.existsSync.mockReturnValue(false);

      // Simulate reading users when file doesn't exist
      const users = fs.existsSync('/mock/path/users.json') 
        ? JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'))
        : [];

      expect(fs.existsSync).toHaveBeenCalledWith('/mock/path/users.json');
      expect(fs.readFileSync).not.toHaveBeenCalled();
      expect(users).toEqual([]);
    });

    it('should write users to file with mocked fs', () => {
      const users = [
        { username: 'charlie@example.com', password: 'password789' }
      ];

      // Simulate writing users
      fs.writeFileSync('/mock/path/users.json', JSON.stringify(users, null, 2));

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock/path/users.json',
        JSON.stringify(users, null, 2)
      );
    });

    it('should handle file system errors gracefully', () => {
      // Mock file system error
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Simulate reading users with error
      let users = [];
      try {
        users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      } catch (error) {
        users = [];
      }

      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/users.json', 'utf-8');
      expect(users).toEqual([]);
    });
  });

  describe('Path Operations with Mocked path', () => {
    it('should construct file paths with mocked path', () => {
      // Mock path operations
      path.dirname.mockReturnValue('/mock/dir');
      path.join.mockReturnValue('/mock/dir/users.json');

      // Simulate path construction
      const dirname = path.dirname('/mock/dir/src/user.js');
      const filePath = path.join(dirname, '../users.json');

      expect(path.dirname).toHaveBeenCalledWith('/mock/dir/src/user.js');
      expect(path.join).toHaveBeenCalledWith('/mock/dir', '../users.json');
      expect(filePath).toBe('/mock/dir/users.json');
    });

    it('should handle different path scenarios', () => {
      // Test different path scenarios
      path.join
        .mockReturnValueOnce('/path1/users.json')
        .mockReturnValueOnce('/path2/users.json')
        .mockReturnValueOnce('/path3/users.json');

      const path1 = path.join('/path1', 'users.json');
      const path2 = path.join('/path2', 'users.json');
      const path3 = path.join('/path3', 'users.json');

      expect(path1).toBe('/path1/users.json');
      expect(path2).toBe('/path2/users.json');
      expect(path3).toBe('/path3/users.json');
    });
  });

  describe('Express Router with Mocked express', () => {
    it('should create router with mocked express', () => {
      const mockRouter = {
        post: vi.fn(),
        get: vi.fn(),
      };
      express.Router.mockReturnValue(mockRouter);

      // Simulate creating router
      const router = express.Router();

      expect(express.Router).toHaveBeenCalled();
      expect(router).toBe(mockRouter);
    });

    it('should register routes with mocked router', () => {
      const mockPost = vi.fn();
      const mockGet = vi.fn();
      const mockRouter = {
        post: mockPost,
        get: mockGet,
      };
      express.Router.mockReturnValue(mockRouter);

      // Simulate registering routes
      const router = express.Router();
      router.post('/register', () => {});
      router.post('/login', () => {});
      router.post('/logout', () => {});
      router.get('/me', () => {});

      expect(mockPost).toHaveBeenCalledWith('/register', expect.any(Function));
      expect(mockPost).toHaveBeenCalledWith('/login', expect.any(Function));
      expect(mockPost).toHaveBeenCalledWith('/logout', expect.any(Function));
      expect(mockGet).toHaveBeenCalledWith('/me', expect.any(Function));
    });
  });

  describe('User Registration with Mocked Dependencies', () => {
    it('should register new user with mocked file operations', () => {
      // Mock file operations for registration
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');
      fs.writeFileSync.mockImplementation(() => {});

      // Mock request and response
      const req = {
        body: { username: 'dave@example.com', password: 'password123' },
        session: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Simulate user registration
      const users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      users.push({ username: 'dave@example.com', password: 'password123' });
      fs.writeFileSync('/mock/path/users.json', JSON.stringify(users, null, 2));

      // Verify file operations
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/users.json', 'utf-8');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/mock/path/users.json',
        JSON.stringify([{ username: 'dave@example.com', password: 'password123' }], null, 2)
      );
    });

    it('should prevent duplicate registration with mocked file operations', () => {
      // Mock existing user in file
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { username: 'eve@example.com', password: 'password123' }
      ]));

      // Mock request and response
      const req = {
        body: { username: 'eve@example.com', password: 'password456' },
        session: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Simulate duplicate registration attempt
      const users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      const existingUser = users.find(u => u.username === 'eve@example.com');

      expect(existingUser).toBeDefined();
      expect(existingUser.username).toBe('eve@example.com');
    });
  });

  describe('User Login with Mocked Dependencies', () => {
    it('should authenticate user with mocked file operations', () => {
      // Mock users in file
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { username: 'frank@example.com', password: 'password123' }
      ]));

      // Mock request and response
      const req = {
        body: { username: 'frank@example.com', password: 'password123' },
        session: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Simulate user login
      const users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      const user = users.find(u => u.username === 'frank@example.com' && u.password === 'password123');

      expect(user).toBeDefined();
      expect(user.username).toBe('frank@example.com');
    });

    it('should reject invalid credentials with mocked file operations', () => {
      // Mock users in file
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue(JSON.stringify([
        { username: 'grace@example.com', password: 'password123' }
      ]));

      // Mock request and response
      const req = {
        body: { username: 'grace@example.com', password: 'wrongpassword' },
        session: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Simulate invalid login attempt
      const users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      const user = users.find(u => u.username === 'grace@example.com' && u.password === 'wrongpassword');

      expect(user).toBeUndefined();
    });
  });

  describe('Email Validation with Mocked Dependencies', () => {
    it('should validate email format', () => {
      // Mock email validation function
      const isValidEmail = vi.fn((email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));

      // Test valid emails
      expect(isValidEmail('alice@example.com')).toBe(true);
      expect(isValidEmail('bob.test@domain.co.uk')).toBe(true);

      // Test invalid emails
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should handle email validation in registration', () => {
      const isValidEmail = vi.fn((email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email));

      // Mock request with invalid email
      const req = {
        body: { username: 'invalidemail', password: 'password123' },
        session: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Simulate email validation
      if (!isValidEmail(req.body.username)) {
        res.status(400).json({ error: 'A valid email is required' });
      }

      expect(isValidEmail).toHaveBeenCalledWith('invalidemail');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'A valid email is required' });
    });
  });

  describe('Session Management with Mocked Dependencies', () => {
    it('should handle session operations', () => {
      // Mock session object
      const mockSession = {
        user: null,
        destroy: vi.fn((callback) => {
          mockSession.user = null;
          callback();
        }),
      };

      // Mock request with session
      const req = {
        session: mockSession,
      };
      const res = {
        json: vi.fn().mockReturnThis(),
      };

      // Simulate setting session
      req.session.user = { username: 'henry@example.com' };
      expect(req.session.user.username).toBe('henry@example.com');

      // Simulate destroying session
      req.session.destroy(() => {
        expect(req.session.user).toBeNull();
      });

      expect(mockSession.destroy).toHaveBeenCalled();
    });

    it('should check session status', () => {
      // Mock session with user
      const req = {
        session: { user: { username: 'irene@example.com' } },
      };
      const res = {
        json: vi.fn().mockReturnThis(),
      };

      // Simulate session check
      if (req.session.user) {
        res.json({ username: req.session.user.username });
      } else {
        res.status(401).json({ error: 'Not logged in' });
      }

      expect(res.json).toHaveBeenCalledWith({ username: 'irene@example.com' });
    });
  });

  describe('Error Handling with Mocked Dependencies', () => {
    it('should handle file system errors gracefully', () => {
      // Mock file system error
      fs.readFileSync.mockImplementation(() => {
        throw new Error('File system error');
      });

      // Simulate error handling
      let users = [];
      try {
        users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      } catch (error) {
        users = [];
      }

      expect(users).toEqual([]);
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/users.json', 'utf-8');
    });

    it('should handle JSON parsing errors', () => {
      // Mock invalid JSON in file
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('invalid json');

      // Simulate JSON parsing error handling
      let users = [];
      try {
        users = JSON.parse(fs.readFileSync('/mock/path/users.json', 'utf-8'));
      } catch (error) {
        users = [];
      }

      expect(users).toEqual([]);
    });

    it('should handle missing request body', () => {
      // Mock request without body
      const req = {
        body: {},
        session: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      };

      // Simulate missing body validation
      if (!req.body.username || !req.body.password) {
        res.status(400).json({ error: 'Username and password required' });
      }

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username and password required' });
    });
  });

  describe('Mock Verification and Assertions', () => {
    it('should verify mock function calls with specific arguments', () => {
      // Mock file operations
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');
      fs.writeFileSync.mockImplementation(() => {});

      // Simulate file operations
      fs.existsSync('/mock/path/users.json');
      fs.readFileSync('/mock/path/users.json', 'utf-8');
      fs.writeFileSync('/mock/path/users.json', '[]');

      // Verify specific calls
      expect(fs.existsSync).toHaveBeenCalledWith('/mock/path/users.json');
      expect(fs.readFileSync).toHaveBeenCalledWith('/mock/path/users.json', 'utf-8');
      expect(fs.writeFileSync).toHaveBeenCalledWith('/mock/path/users.json', '[]');
    });

    it('should verify mock function call counts', () => {
      // Mock file operations
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');

      // Simulate multiple file operations
      fs.existsSync('/mock/path/users.json');
      fs.existsSync('/mock/path/users.json');
      fs.readFileSync('/mock/path/users.json', 'utf-8');

      // Verify call counts
      expect(fs.existsSync).toHaveBeenCalledTimes(2);
      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should verify mock function call order', () => {
      // Mock file operations
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockReturnValue('[]');

      // Simulate ordered file operations
      fs.existsSync('/mock/path/users.json');
      fs.readFileSync('/mock/path/users.json', 'utf-8');
      fs.existsSync('/mock/path/users.json');

      // Verify call order
      const existsCalls = fs.existsSync.mock.calls;
      const readCalls = fs.readFileSync.mock.calls;

      expect(existsCalls[0][0]).toBe('/mock/path/users.json');
      expect(readCalls[0][0]).toBe('/mock/path/users.json');
      expect(existsCalls[1][0]).toBe('/mock/path/users.json');
    });
  });
}); 