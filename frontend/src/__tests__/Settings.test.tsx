import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { UserProvider } from '../contexts/UserContext';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import Settings from '../pages/Settings';
import { Toaster } from '../components/ui/toaster';

// Mock the contexts
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com', name: 'Test User', language: 'en' },
    setUser: jest.fn(),
    isLoading: false
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    settings: {
      name: 'Test User',
      language: 'en'
    },
    updateSettings: jest.fn(),
    isLoading: false
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

jest.mock('../contexts/PomodoroContext', () => ({
  usePomodoro: () => ({
    settings: {
      workInterval: 25,
      breakInterval: 5,
      intervalsCount: 4
    },
    updateSettings: jest.fn()
  }),
  PomodoroProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

const renderSettings = () => {
  render(
    <BrowserRouter>
      <AuthProvider>
        <UserProvider>
          <PomodoroProvider>
            <Settings />
            <Toaster />
          </PomodoroProvider>
        </UserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders settings form with current values', () => {
    renderSettings();
    
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test User');
    expect(screen.getByLabelText(/work interval/i)).toHaveValue('25');
    expect(screen.getByLabelText(/break interval/i)).toHaveValue('5');
    expect(screen.getByLabelText(/intervals count/i)).toHaveValue('4');
  });

  test('validates work interval input', async () => {
    renderSettings();
    
    const workIntervalInput = screen.getByLabelText(/work interval/i);
    fireEvent.change(workIntervalInput, { target: { value: '0' } });
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/work interval must be between 1 and/i)).toBeInTheDocument();
    });
  });

  test('validates break interval input', async () => {
    renderSettings();
    
    const breakIntervalInput = screen.getByLabelText(/break interval/i);
    fireEvent.change(breakIntervalInput, { target: { value: '0' } });
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/break interval must be between 1 and/i)).toBeInTheDocument();
    });
  });

  test('validates intervals count input', async () => {
    renderSettings();
    
    const intervalsInput = screen.getByLabelText(/intervals count/i);
    fireEvent.change(intervalsInput, { target: { value: '0' } });
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/intervals count must be between 1 and/i)).toBeInTheDocument();
    });
  });

  test('validates name input', async () => {
    renderSettings();
    
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: '123' } });
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name can only contain letters, spaces and hyphens/i)).toBeInTheDocument();
    });
  });

  test('shows confirmation dialog on valid form submission', async () => {
    renderSettings();
    
    const nameInput = screen.getByLabelText(/name/i);
    const workIntervalInput = screen.getByLabelText(/work interval/i);
    const breakIntervalInput = screen.getByLabelText(/break interval/i);
    const intervalsInput = screen.getByLabelText(/intervals count/i);
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(workIntervalInput, { target: { value: '30' } });
    fireEvent.change(breakIntervalInput, { target: { value: '10' } });
    fireEvent.change(intervalsInput, { target: { value: '3' } });
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/save settings\?/i)).toBeInTheDocument();
      expect(screen.getByText(/are you sure you want to save these settings\?/i)).toBeInTheDocument();
    });
  });

  test('calls update functions on settings confirmation', async () => {
    const mockUpdateUserSettings = jest.fn();
    const mockUpdatePomodoroSettings = jest.fn();
    
    jest.spyOn(require('../contexts/UserContext'), 'useUser').mockImplementation(() => ({
      settings: {
        name: 'Test User',
        language: 'en'
      },
      updateSettings: mockUpdateUserSettings,
      isLoading: false
    }));

    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      updateSettings: mockUpdatePomodoroSettings
    }));

    renderSettings();
    
    const nameInput = screen.getByLabelText(/name/i);
    const workIntervalInput = screen.getByLabelText(/work interval/i);
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(workIntervalInput, { target: { value: '30' } });
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalledWith({
        name: 'New Name',
        language: 'en'
      });
      expect(mockUpdatePomodoroSettings).toHaveBeenCalledWith({
        workInterval: 30,
        breakInterval: 5,
        intervalsCount: 4
      });
    });
  });
}); 