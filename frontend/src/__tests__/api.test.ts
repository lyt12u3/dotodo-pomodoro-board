import { login, logout, register, getCurrentUser, getUserSettings, updateUserSettings, updatePomodoroSession } from '../lib/api';

// Mock fetch globally
global.fetch = jest.fn();

describe('API Functions', () => {
  const mockFetch = jest.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    // Clear all mocks before each test
    mockFetch.mockClear();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = { id: 1, email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await login('test@example.com', 'password123');
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
        credentials: 'include'
      });
    });

    it('should throw error with invalid credentials', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      await expect(login('test@example.com', 'wrongpassword'))
        .rejects
        .toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = { id: 1, email: 'test@example.com', name: 'Test User' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await register('test@example.com', 'password123', 'Test User');
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        }),
        credentials: 'include'
      });
    });

    it('should throw error if email already exists', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      });

      await expect(register('existing@example.com', 'password123', 'Test User'))
        .rejects
        .toThrow('Email already exists');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data when authenticated', async () => {
      const mockResponse = { id: 1, email: 'test@example.com' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getCurrentUser();
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/users/me', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    });

    it('should throw error when not authenticated', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(getCurrentUser())
        .rejects
        .toThrow('Unauthorized');
    });
  });

  describe('getUserSettings', () => {
    it('should return user settings when authenticated', async () => {
      const mockResponse = { name: 'Test User', language: 'en' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await getUserSettings();
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/users/settings', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    });
  });

  describe('updateUserSettings', () => {
    it('should successfully update user settings', async () => {
      const mockResponse = { name: 'New Name', language: 'fr' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updateUserSettings({ name: 'New Name', language: 'fr' });
      
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/users/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'New Name', language: 'fr' }),
        credentials: 'include'
      });
    });

    it('should throw error when validation fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Invalid settings' }),
      });

      await expect(updateUserSettings({ workInterval: -1 }))
        .rejects
        .toThrow('Invalid settings');
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updatePomodoroSession('1', {
        endTime: '2024-03-20T10:25:00Z',
        completed: true
      });

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/pomodoro-sessions/1', {
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

  describe('logout', () => {
    it('should successfully logout', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({})
      });

      await logout();
      
      expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
    });

    it('should throw error when logout fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      await expect(logout())
        .rejects
        .toThrow('Server error');
    });
  });
}); 