import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Register from '../pages/Register';
import { Toaster } from '../components/ui/toaster';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from '../components/ui/toast';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the auth context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    register: jest.fn(),
    user: null,
    isLoading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: jest.fn(),
    },
  }),
}));

// Mock translations
i18n.init({
  lng: 'en',
  resources: {
    en: {
      translation: {
        'auth.register.name': 'Name',
        'auth.register.email': 'Email',
        'auth.register.password': 'Password',
        'auth.register.confirmPassword': 'Confirm Password',
        'auth.register.submit': 'Sign Up',
        'auth.register.title': 'Create your account',
        'auth.register.namePlaceholder': 'Enter your name',
        'auth.register.emailPlaceholder': 'Enter your email',
        'auth.register.passwordPlaceholder': 'Enter your password',
        'auth.register.confirmPasswordPlaceholder': 'Confirm your password',
        'auth.register.haveAccount': 'Already have an account?',
        'auth.register.signIn': 'Sign In',
        'auth.register.error': 'Error',
        'auth.register.success': 'Success',
        'auth.register.successDesc': 'Your account has been created successfully',
        'auth.register.togglePassword': 'Toggle password visibility'
      }
    }
  }
});

const mockUser = {
  id: 1,
  email: 'test@example.com',
  name: 'Test User'
};

const renderRegister = () => {
  render(
    <I18nextProvider i18n={i18n}>
      <ToastProvider>
        <AuthProvider>
          <Register />
          <Toaster />
        </AuthProvider>
      </ToastProvider>
    </I18nextProvider>
  );
};

/**
 * Test suite for Register component
 * Tests the registration functionality including:
 * - Form rendering and validation
 * - User input handling
 * - Registration flow
 * - Error handling and display
 * - Navigation after registration
 */

// Mock the router navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock API calls
vi.mock('../lib/api', () => ({
  register: vi.fn()
}));

describe('Register Component', () => {
  /**
   * Reset all mocks before each test
   * Ensures clean state for testing
   */
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Test form rendering
   * Verifies that all necessary form elements are present
   * and properly labeled
   */
  it('should render registration form', () => {
    renderRegister();
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  /**
   * Test form validation
   * Verifies that:
   * - Required fields are enforced
   * - Email format is validated
   * - Password requirements are checked
   * - Password confirmation matches
   */
  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      renderRegister();
      
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      await act(async () => {
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderRegister();
      
      const emailInput = screen.getByLabelText('Email');
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      });
      
      const form = screen.getByRole('form');
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate password length', async () => {
      renderRegister();
      
      const passwordInput = screen.getByLabelText('Password');
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: '123' } });
      });
      
      const form = screen.getByRole('form');
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      renderRegister();
      
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      
      await act(async () => {
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
      });
      
      const form = screen.getByRole('form');
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test successful registration flow
   * Verifies that:
   * - Form submission works
   * - API is called with correct data
   * - User is redirected after success
   * - Success message is shown
   */
  describe('Registration Flow', () => {
    it('should handle successful registration', async () => {
      const { register } = require('../lib/api');
      register.mockResolvedValueOnce({ id: 1, email: 'test@example.com', name: 'Test User' });

      renderRegister();
      
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const nameInput = screen.getByLabelText('Name');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Your account has been created successfully')).toBeInTheDocument();
      });
    });

    /**
     * Test error handling
     * Verifies that:
     * - API errors are caught
     * - Error messages are displayed
     * - Form remains interactive
     */
    it('should handle registration error', async () => {
      const { register } = require('../lib/api');
      register.mockRejectedValueOnce(new Error('Email already exists'));

      renderRegister();
      
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const confirmPasswordInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: 'Sign Up' });

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(register).toHaveBeenCalledWith('existing@example.com', 'password123', 'Test User');
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  /**
   * Test navigation
   * Verifies that:
   * - Login link works
   * - Navigation is handled correctly
   */
  describe('Navigation', () => {
    it('should navigate to login page', () => {
      renderRegister();
      
      const loginLink = screen.getByText(/already have an account/i);
      fireEvent.click(loginLink);

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
}); 