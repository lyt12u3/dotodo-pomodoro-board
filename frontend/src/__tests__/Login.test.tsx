import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import { Toaster } from '../components/ui/toaster';
import { useTranslation } from 'react-i18next';
import { ToastProvider } from '../components/ui/toast';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';

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

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('validates email format', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText('Email');
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('validates password length', async () => {
    renderLogin();
    
    const form = screen.getByRole('form');
    const passwordInput = screen.getByLabelText('Password');
    
    await act(async () => {
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('toggles password visibility', async () => {
    renderLogin();
    
    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByRole('button', { name: 'Toggle password visibility' });
    await act(async () => {
      fireEvent.click(toggleButton);
    });

    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  test('handles successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({});
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
    });
    
    const form = screen.getByRole('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('handles login error', async () => {
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
    });
    
    const form = screen.getByRole('form');
    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
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