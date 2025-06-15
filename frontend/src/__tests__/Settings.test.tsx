import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from '../pages/Settings';
import { AuthProvider } from '../contexts/AuthContext';
import { ToastProvider } from '../components/ui/toast';

/**
 * Test suite for Settings component
 * Tests the user settings functionality including:
 * - Settings form rendering
 * - User preferences management
 * - Theme switching
 * - Language selection
 * - Notification settings
 * - Form validation and submission
 */

// Mock API calls
vi.mock('../lib/api', () => ({
  getUserSettings: vi.fn(),
  updateUserSettings: vi.fn()
}));

// Mock theme context
vi.mock('../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn()
  })
}));

// Wrapper component for tests
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <AuthProvider>
      <ToastProvider>
        {component}
      </ToastProvider>
    </AuthProvider>
  );
};

describe('Settings Component', () => {
  /**
   * Reset all mocks and local storage before each test
   * Ensures clean state for testing
   */
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  /**
   * Test initial settings form rendering
   * Verifies that all form elements are present
   * and properly initialized
   */
  it('should render settings form', () => {
    renderWithProviders(<Settings />);
    
    expect(screen.getByLabelText(/theme/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/language/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notifications/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  /**
   * Test theme switching functionality
   * Verifies that:
   * - Theme options are available
   * - Theme changes are applied
   * - Theme persistence works
   */
  describe('Theme Settings', () => {
    it('should switch theme', async () => {
      const { setTheme } = require('../contexts/ThemeContext').useTheme();
      renderWithProviders(<Settings />);
      
      const themeSelect = screen.getByLabelText(/theme/i);
      fireEvent.change(themeSelect, { target: { value: 'dark' } });

      await waitFor(() => {
        expect(setTheme).toHaveBeenCalledWith('dark');
      });
    });

    it('should persist theme preference', async () => {
      const { updateUserSettings } = require('../lib/api');
      renderWithProviders(<Settings />);
      
      const themeSelect = screen.getByLabelText(/theme/i);
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateUserSettings).toHaveBeenCalledWith(expect.objectContaining({
          theme: 'dark'
        }));
      });
    });
  });

  /**
   * Test language selection functionality
   * Verifies that:
   * - Language options are available
   * - Language changes are applied
   * - Language persistence works
   */
  describe('Language Settings', () => {
    it('should change language', async () => {
      renderWithProviders(<Settings />);
      
      const languageSelect = screen.getByLabelText(/language/i);
      fireEvent.change(languageSelect, { target: { value: 'es' } });

      await waitFor(() => {
        expect(screen.getByDisplayValue('es')).toBeInTheDocument();
      });
    });

    it('should persist language preference', async () => {
      const { updateUserSettings } = require('../lib/api');
      renderWithProviders(<Settings />);
      
      const languageSelect = screen.getByLabelText(/language/i);
      fireEvent.change(languageSelect, { target: { value: 'es' } });
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateUserSettings).toHaveBeenCalledWith(expect.objectContaining({
          language: 'es'
        }));
      });
    });
  });

  /**
   * Test notification settings
   * Verifies that:
   * - Notification toggles work
   * - Notification preferences are saved
   * - Permission handling works
   */
  describe('Notification Settings', () => {
    it('should toggle notifications', async () => {
      renderWithProviders(<Settings />);
      
      const notificationToggle = screen.getByLabelText(/notifications/i);
      fireEvent.click(notificationToggle);

      await waitFor(() => {
        expect(notificationToggle).toBeChecked();
      });
    });

    it('should persist notification preferences', async () => {
      const { updateUserSettings } = require('../lib/api');
      renderWithProviders(<Settings />);
      
      const notificationToggle = screen.getByLabelText(/notifications/i);
      fireEvent.click(notificationToggle);
      
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(updateUserSettings).toHaveBeenCalledWith(expect.objectContaining({
          notifications: true
        }));
      });
    });

    it('should handle notification permission denial', async () => {
      // Mock notification permission
      Object.defineProperty(window, 'Notification', {
        value: {
          permission: 'denied',
          requestPermission: vi.fn()
        }
      });

      renderWithProviders(<Settings />);
      
      const notificationToggle = screen.getByLabelText(/notifications/i);
      fireEvent.click(notificationToggle);

      await waitFor(() => {
        expect(screen.getByText(/notification permission denied/i)).toBeInTheDocument();
        expect(notificationToggle).not.toBeChecked();
      });
    });
  });

  /**
   * Test settings form submission
   * Verifies that:
   * - Form validation works
   * - API calls are made correctly
   * - Success/error messages are shown
   */
  describe('Settings Submission', () => {
    it('should save all settings successfully', async () => {
      const { updateUserSettings } = require('../lib/api');
      updateUserSettings.mockResolvedValueOnce({
        theme: 'dark',
        language: 'es',
        notifications: true
      });

      renderWithProviders(<Settings />);
      
      // Update all settings
      fireEvent.change(screen.getByLabelText(/theme/i), { target: { value: 'dark' } });
      fireEvent.change(screen.getByLabelText(/language/i), { target: { value: 'es' } });
      fireEvent.click(screen.getByLabelText(/notifications/i));
      
      // Save settings
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(updateUserSettings).toHaveBeenCalledWith({
          theme: 'dark',
          language: 'es',
          notifications: true
        });
        expect(screen.getByText(/settings saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle settings update error', async () => {
      const { updateUserSettings } = require('../lib/api');
      updateUserSettings.mockRejectedValueOnce(new Error('Failed to update settings'));

      renderWithProviders(<Settings />);
      
      // Try to save settings
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText(/failed to update settings/i)).toBeInTheDocument();
      });
    });
  });

  /**
   * Test settings loading
   * Verifies that:
   * - Initial settings are loaded
   * - Loading states are handled
   * - Error states are handled
   */
  describe('Settings Loading', () => {
    it('should load user settings on mount', async () => {
      const { getUserSettings } = require('../lib/api');
      getUserSettings.mockResolvedValueOnce({
        theme: 'dark',
        language: 'es',
        notifications: true
      });

      renderWithProviders(<Settings />);

      await waitFor(() => {
        expect(getUserSettings).toHaveBeenCalled();
        expect(screen.getByDisplayValue('dark')).toBeInTheDocument();
        expect(screen.getByDisplayValue('es')).toBeInTheDocument();
        expect(screen.getByLabelText(/notifications/i)).toBeChecked();
      });
    });

    it('should handle settings loading error', async () => {
      const { getUserSettings } = require('../lib/api');
      getUserSettings.mockRejectedValueOnce(new Error('Failed to load settings'));

      renderWithProviders(<Settings />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load settings/i)).toBeInTheDocument();
      });
    });
  });
}); 