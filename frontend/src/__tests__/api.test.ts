import { login, logout, register, getCurrentUser, getUserSettings, updateUserSettings, updatePomodoroSession } from '../lib/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Test suite for API functionality
 * Tests all API endpoints including:
 * - Authentication (login, register, logout)
 * - User management (get current user, update user)
 * - Error handling and response parsing
 */

// Mock fetch globally
global.fetch = jest.fn();

describe('API Tests', () => {
  /**
   * Reset mocks and local storage before each test
   * Ensures clean state for API calls
   */
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    global.fetch = vi.fn();
  });

  /**
   * Test login API endpoint
   * Verifies:
   * - Correct request format
   * - Token storage
   * - Response handling
   * - Error cases
   */
  describe('login()', () => {
    it('should make correct API call and store token', async () => {
      const mockResponse = {
        token: 'test-token',
        user: { id: 1, email: 'test@example.com' }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await login('test@example.com', 'password');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password' })
      });

      expect(localStorage.getItem('token')).toBe('test-token');
      expect(result).toEqual(mockResponse.user);
    });

    it('should handle login errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      await expect(login('test@example.com', 'wrong-password'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  /**
   * Test registration API endpoint
   * Verifies:
   * - User creation
   * - Automatic login after registration
   * - Data validation
   * - Error handling
   */
  describe('register()', () => {
    it('should register new user and login', async () => {
      const mockResponse = {
        token: 'new-user-token',
        user: { id: 1, email: 'new@example.com', name: 'New User' }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await register('new@example.com', 'password', 'New User');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'new@example.com',
          password: 'password',
          name: 'New User'
        })
      });

      expect(localStorage.getItem('token')).toBe('new-user-token');
      expect(result).toEqual(mockResponse.user);
    });

    it('should handle registration errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Email already exists' })
      });

      await expect(register('existing@example.com', 'password', 'Test User'))
        .rejects.toThrow('Email already exists');
    });
  });

  /**
   * Test logout functionality
   * Verifies:
   * - Token removal
   * - Server notification
   * - State cleanup
   */
  describe('logout()', () => {
    it('should clear token and notify server', async () => {
      localStorage.setItem('token', 'test-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await logout();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  /**
   * Test current user retrieval
   * Verifies:
   * - Authentication check
   * - User data fetching
   * - Token validation
   */
  describe('getCurrentUser()', () => {
    it('should fetch current user with valid token', async () => {
      localStorage.setItem('token', 'test-token');

      const mockUser = { id: 1, email: 'test@example.com' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUser)
      });

      const result = await getCurrentUser();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      expect(result).toEqual(mockUser);
    });

    it('should return null when no token exists', async () => {
      const result = await getCurrentUser();
      expect(result).toBeNull();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  /**
   * Test user profile updates
   * Verifies:
   * - Data validation
   * - Update processing
   * - Response handling
   * - Error cases
   */
  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      localStorage.setItem('token', 'test-token');

      const updates = { name: 'Updated Name', language: 'en' };
      const mockResponse = { id: 1, ...updates };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updateUserSettings(updates);

      expect(global.fetch).toHaveBeenCalledWith('/api/users/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify(updates),
        credentials: 'include'
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle update errors', async () => {
      localStorage.setItem('token', 'test-token');

      const updates = { name: 'Updated Name', language: 'en' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Update failed' })
      });

      await expect(updateUserSettings(updates)).rejects.toThrow('Update failed');
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings when authenticated', async () => {
      const mockResponse = { name: 'Test User', language: 'en' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getUserSettings();
      
      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/users/settings', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    });
  });

  describe('updatePomodoroSession', () => {
    test('should successfully update pomodoro session', async () => {
      const mockResponse = {
        id: '1',
        taskId: '',
        startTime: '2024-03-20T10:00:00Z',
        endTime: '2024-03-20T10:25:00Z',
        duration: 1500,
        completed: true
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updatePomodoroSession('1', {
        endTime: '2024-03-20T10:25:00Z',
        completed: true
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith('/api/pomodoro-sessions/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endTime: '2024-03-20T10:25:00Z',
          completed: true
        }),
        credentials: 'include'
      });
    });
  });
}); 