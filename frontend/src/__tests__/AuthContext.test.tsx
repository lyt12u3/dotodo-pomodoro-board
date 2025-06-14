import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/toast';

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

const TestComponent = () => {
  const { user, isLoading, login, logout, register } = require('../contexts/AuthContext').useAuth();
  return (
    <div>
      <div data-testid="loading-state">{isLoading.toString()}</div>
      <div data-testid="user-state">{user ? JSON.stringify(user) : 'null'}</div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => register('test@example.com', 'password123', 'Test User')}>Register</button>
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
  jest.clearAllMocks();
  const { getCurrentUser } = require('../lib/api');
  getCurrentUser.mockResolvedValue(null);
  localStorage.clear();
});

describe('AuthContext', () => {
  test('handles successful login', async () => {
    const { login } = require('../lib/api');
    login.mockResolvedValueOnce(mockUser);

    renderWithAuth();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByTestId('user-state')).toHaveTextContent(JSON.stringify(mockUser));
    });
  });

  test('handles login error', async () => {
    const { login } = require('../lib/api');
    login.mockRejectedValueOnce(new Error('Invalid credentials'));

    renderWithAuth();

    const loginButton = screen.getByText('Login');
    await act(async () => {
      fireEvent.click(loginButton);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByTestId('user-state')).toHaveTextContent('null');
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

  test('handles successful logout', async () => {
    const { logout, getCurrentUser } = require('../lib/api');
    getCurrentUser.mockResolvedValueOnce(mockUser);
    logout.mockResolvedValueOnce(undefined);

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