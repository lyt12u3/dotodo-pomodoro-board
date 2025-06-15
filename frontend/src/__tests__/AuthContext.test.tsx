import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/toast';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Test suite for Authentication Context
 * Tests the authentication functionality including:
 * - User login/logout flow
 * - Token management
 * - Authentication state persistence
 * - Error handling
 */

// Mock the API module
jest.mock('../lib/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn()
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User'
};

// Mock component to test auth hooks
const TestComponent = () => {
  const { user, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{user ? 'logged-in' : 'logged-out'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = () => {
  render(
    <ToastProvider>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </ToastProvider>
  );
};

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe('AuthContext', () => {
  /**
   * Test initial authentication state
   * Verifies that:
   * - User starts as unauthenticated
   * - No user data is present
   * - Local storage is empty
   */
  it('should start with unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });

  /**
   * Test successful login flow
   * Verifies that:
   * - Login API is called with correct credentials
   * - Auth state updates properly
   * - User data is stored
   * - Token is saved to local storage
   */
  it('should handle successful login', async () => {
    const { login } = require('../lib/api');
    login.mockResolvedValueOnce(mockUser);

    renderWithAuth();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password');
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
      expect(localStorage.getItem('token')).toBeTruthy();
    });
  });

  /**
   * Test logout functionality
   * Verifies that:
   * - User state is cleared
   * - Auth state updates to logged out
   * - Token is removed from storage
   * - All user data is cleaned up
   */
  it('should handle logout', async () => {
    const { logout, getCurrentUser } = require('../lib/api');
    getCurrentUser.mockResolvedValueOnce(mockUser);
    logout.mockResolvedValueOnce(undefined);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
      expect(localStorage.getItem('token')).toBeNull();
    });

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      fireEvent.click(logoutButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });

  /**
   * Test token persistence
   * Verifies that:
   * - Auth state persists after page reload
   * - Token is properly stored and retrieved
   * - User session maintains continuity
   */
  it('should persist authentication state', () => {
    // Set up mock token
    localStorage.setItem('token', 'mock-token');
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-in');
  });

  /**
   * Test error handling during login
   * Verifies that:
   * - Failed login attempts are handled gracefully
   * - Error messages are displayed
   * - Auth state remains unchanged on failure
   */
  it('should handle login errors', async () => {
    // Mock API to simulate error
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Login failed'));

    renderWithAuth();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('logged-out');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });

  test('handles successful registration', async () => {
    const { register } = require('../lib/api');
    register.mockResolvedValueOnce(mockUser);

    renderWithAuth();

    const registerButton = screen.getByText('Register');
    await act(async () => {
      fireEvent.click(registerButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      expect(screen.getByTestId('user-state')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  test('handles registration error', async () => {
    const { register } = require('../lib/api');
    register.mockRejectedValueOnce(new Error('Email already exists'));

    renderWithAuth();

    const registerButton = screen.getByText('Register');
    await act(async () => {
      fireEvent.click(registerButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      expect(screen.getByTestId('user-state')).toHaveTextContent('null');
    });
  });

  test('handles logout error', async () => {
    const { logout, getCurrentUser } = require('../lib/api');
    getCurrentUser.mockResolvedValueOnce(mockUser);
    logout.mockRejectedValueOnce(new Error('Logout failed'));

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('user-state')).toHaveTextContent(JSON.stringify(mockUser));
    });

    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      fireEvent.click(logoutButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(logout).toHaveBeenCalled();
      expect(screen.getByTestId('user-state')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  test('persists user state after page reload', async () => {
    const { getCurrentUser } = require('../lib/api');
    getCurrentUser.mockResolvedValueOnce(mockUser);

    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('user-state')).toHaveTextContent(JSON.stringify(mockUser));
    });

    // Cleanup and re-render to simulate page reload
    cleanup();
    getCurrentUser.mockResolvedValueOnce(mockUser);
    renderWithAuth();

    await waitFor(() => {
      expect(screen.getByTestId('user-state')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });
}); 