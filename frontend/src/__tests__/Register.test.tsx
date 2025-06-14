import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Register from '../pages/Register';
import { Toaster } from '../components/ui/toaster';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from '../components/ui/toast';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders register form', () => {
    renderRegister();
    
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('shows validation errors for empty fields', async () => {
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

  test('shows error for invalid email format', async () => {
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

  test('shows error for short password', async () => {
    renderRegister();
    
    const passwordInput = screen.getByLabelText('Password');
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '12345' } });
    });
    
    const form = screen.getByRole('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  test('shows error when passwords do not match', async () => {
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

  test('shows error for invalid name format', async () => {
    renderRegister();
    
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name can only contain letters and spaces/i)).toBeInTheDocument();
    });
  });

  test('calls register function with valid data', async () => {
    const mockRegister = jest.fn();
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      register: mockRegister,
      user: null,
      isLoading: false
    }));

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
      expect(mockRegister).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        'Test User'
      );
    });
  });

  test('toggles password visibility', async () => {
    renderRegister();
    
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: 'Toggle password visibility' });
    await act(async () => {
      fireEvent.click(toggleButtons[0]); // Toggle password
      fireEvent.click(toggleButtons[1]); // Toggle confirm password
    });

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(confirmPasswordInput).toHaveAttribute('type', 'text');
  });

  test('redirects to dashboard when already authenticated', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);
    
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      register: jest.fn(),
      isLoading: false
    }));

    renderRegister();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  test('shows error toast on registration failure', async () => {
    const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      register: mockRegister,
      isLoading: false
    }));

    renderRegister();
    
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Sign Up' });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  test('shows loading state while checking authentication', async () => {
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      register: jest.fn(),
      isLoading: true
    }));

    renderRegister();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  test('shows success toast and redirects on successful registration', async () => {
    const mockRegister = jest.fn().mockResolvedValue({ id: 1, email: 'test@example.com', name: 'Test User' });
    const mockNavigate = jest.fn();
    jest.spyOn(require('../contexts/AuthContext'), 'useAuth').mockImplementation(() => ({
      user: null,
      register: mockRegister,
      isLoading: false
    }));
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockImplementation(() => mockNavigate);

    renderRegister();
    
    const nameInput = screen.getByLabelText('Name');
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    const submitButton = screen.getByRole('button', { name: 'Sign Up' });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Your account has been created successfully')).toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
}); 