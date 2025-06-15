import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import { Toaster } from '../components/ui/toaster';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from '../components/ui/toast';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Test suite for Login component
 * Tests the login functionality including:
 * - Form rendering and validation
 * - User input handling
 * - Authentication flow
 * - Error handling and display
 * - Navigation after login
 */

// Mock the contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    isLoading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock translations
i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'auth.login.email': 'Email',
        'auth.login.password': 'Password',
        'auth.login.submit': 'Sign In',
        'auth.login.emailRequired': 'Email is required',
        'auth.login.passwordRequired': 'Password is required',
        'auth.login.passwordLength': 'Password must be at least {{length}} characters',
        'auth.login.authRequired': 'Authentication Required',
        'auth.login.authRequiredDesc': 'Please sign in to continue',
        'auth.login.error': 'Error',
        'auth.login.invalidCredentials': 'Invalid credentials',
        'auth.login.togglePassword': 'Toggle password visibility',
        'auth.login.noAccount': 'Don\'t have an account?',
        'auth.login.signUp': 'Sign Up',
        'auth.login.title': 'Sign in to your account',
        'auth.login.emailPlaceholder': 'Enter your email',
        'auth.login.passwordPlaceholder': 'Enter your password'
      }
    }
  }
});

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User'
};

const mockTranslation = jest.requireMock('react-i18next').useTranslation();
const { t } = mockTranslation;

const renderLogin = () => {
  render(
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <AuthProvider>
          <Login />
          <Toaster />
        </AuthProvider>
      </ToastProvider>
    </I18nextProvider>
  );
};

// Mock the router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API calls
vi.mock('../lib/api', () => ({
  login: vi.fn()
}));

describe('Login Component', () => {
  /**
   * Reset all mocks before each test
   * Ensures clean state for testing
   */
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Test form rendering
   * Verifies that all necessary form elements are present
   * and properly labeled
   */
  it('should render login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText('Don\'t have an account?')).toBeInTheDocument();
  });

  /**
   * Test form validation
   * Verifies that:
   * - Required fields are enforced
   * - Email format is validated
   * - Password requirements are checked
   */
  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      renderLogin();
      
      const loginButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderLogin();
      
      const emailInput = screen.getByLabelText('Email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const loginButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      renderLogin();
      
      const passwordInput = screen.getByLabelText('Password');
      fireEvent.change(passwordInput, { target: { value: '123' } });
      
      const loginButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });

  /**
   * Test successful login flow
   * Verifies that:
   * - Form submission works
   * - API is called with correct data
   * - User is redirected after success
   * - Success message is shown
   */
  describe('Login Flow', () => {
    it('should handle successful login', async () => {
      const { login } = require('../lib/api');
      login.mockResolvedValueOnce({ id: 1, email: 'test@example.com' });

      renderLogin();
      
      // Fill form
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'password123' }
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(screen.getByText('Successfully logged in')).toBeInTheDocument();
      });
    });

    /**
     * Test error handling
     * Verifies that:
     * - API errors are caught
     * - Error messages are displayed
     * - Form remains interactive
     */
    it('should handle login error', async () => {
      const { login } = require('../lib/api');
      login.mockRejectedValueOnce(new Error('Invalid credentials'));

      renderLogin();
      
      // Fill form
      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrongpassword' }
      });
      
      // Submit form
      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      await waitFor(() => {
        expect(login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * Test navigation links
   * Verifies that:
   * - Register link works
   * - Forgot password link works
   * - Navigation is handled correctly
   */
  describe('Navigation', () => {
    it('should navigate to register page', () => {
      renderLogin();
      
      const registerLink = screen.getByText('Don\'t have an account?');
      fireEvent.click(registerLink);

      expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    it('should navigate to forgot password page', () => {
      renderLogin();
      
      const forgotPasswordLink = screen.getByText('Forgot password');
      fireEvent.click(forgotPasswordLink);

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });
  });

  test('shows loading state during authentication', async () => {
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: jest.fn(),
      isLoading: true
    }));

    renderLogin();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('redirects to dashboard when already authenticated', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: mockUser,
      login: jest.fn(),
      isLoading: false
    }));

    renderLogin();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  test('shows loading state while checking authentication', async () => {
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: jest.fn(),
      isLoading: true
    }));

    renderLogin();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });

  test('shows auth-required toast when redirected with message param', async () => {
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: jest.fn(),
      isLoading: false
    }));

    jest.spyOn(require('react-router-dom'), 'useLocation').mockImplementation(() => ({
      search: '?message=auth-required',
      pathname: '/login',
      hash: '',
      state: null,
      key: 'default',
    }));

    renderLogin();

    await waitFor(() => {
      expect(screen.getByText('Authentication Required')).toBeInTheDocument();
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
    });
  });

  test('shows error toast on login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: mockLogin,
      isLoading: false
    }));

    renderLogin();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      const form = screen.getByRole('form');
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  test('prevents empty form submission', async () => {
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: jest.fn(),
      isLoading: false
    }));

    renderLogin();
    
    const form = screen.getByRole('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  test('navigates to register page when clicking Sign Up link', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    renderLogin();
    
    const signUpLink = screen.getByText('Sign Up');
    await act(async () => {
      fireEvent.click(signUpLink);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('persists email in localStorage after successful login attempt', async () => {
    const testEmail = 'test@example.com';
    const mockLogin = jest.fn().mockResolvedValue({ id: 1, email: testEmail });
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: mockLogin,
      isLoading: false
    }));

    renderLogin();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: testEmail } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      const form = screen.getByRole('form');
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(localStorage.getItem('lastEmail')).toBe(testEmail);
    });
  });

  test('loads email from localStorage on initial render', async () => {
    const testEmail = 'test@example.com';
    localStorage.setItem('lastEmail', testEmail);

    renderLogin();
    
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    expect(emailInput.value).toBe(testEmail);
  });

  test('disables form elements during submission', async () => {
    let resolveLogin: () => void;
    const loginPromise = new Promise<void>((resolve) => {
      resolveLogin = resolve;
    });
    
    const mockLogin = jest.fn().mockImplementation(() => loginPromise);
    const mockSetLoading = jest.fn();
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: mockLogin,
      isLoading: true,
      setLoading: mockSetLoading
    }));

    renderLogin();
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      const form = screen.getByRole('form');
      fireEvent.submit(form);
    });

    expect(submitButton).toHaveTextContent('Sign In');
    expect(emailInput).toHaveAttribute('disabled');
    expect(passwordInput).toHaveAttribute('disabled');
    expect(submitButton).toHaveAttribute('disabled');

    await act(async () => {
      resolveLogin();
      await loginPromise;
    });
  });

  test('language toggle changes UI language', async () => {
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      login: jest.fn(),
      isLoading: false
    }));

    const mockChangeLanguage = jest.fn();
    jest.spyOn(i18n, 'changeLanguage').mockImplementation(mockChangeLanguage);

    renderLogin();
    
    const languageToggle = screen.getByTestId('language-toggle');
    await act(async () => {
      fireEvent.click(languageToggle);
    });

    const englishOption = screen.getByText('English');
    await act(async () => {
      fireEvent.click(englishOption);
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('en');
  });
}); 