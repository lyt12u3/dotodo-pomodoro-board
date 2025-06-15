import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import { UserProvider } from '../contexts/UserContext';
import Pomodoro from '../pages/Pomodoro';
import { Toaster } from 'sonner';

/**
 * Test suite for Pomodoro component
 * Tests the Pomodoro timer functionality including:
 * - Timer controls (start, pause, reset)
 * - Work/break mode switching
 * - Time tracking and display
 * - Session completion handling
 * - Sound notifications
 */

// Mock the contexts
vi.mock('../contexts/PomodoroContext', () => ({
  usePomodoro: () => ({
    settings: {
      workInterval: 25,
      breakInterval: 5,
      intervalsCount: 4
    },
    isRunning: false,
    isPaused: false,
    currentInterval: 1,
    timeLeft: 1500, // 25 minutes in seconds
    isWorkTime: true,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
    skip: vi.fn()
  }),
  PomodoroProvider: ({ children }) => <>{children}</>
}));

jest.mock('../contexts/UserContext', () => ({
  useUser: () => ({
    settings: {
      name: 'Test User',
      language: 'en'
    },
    isLoading: false
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock audio playback
const mockPlay = vi.fn();
const mockPause = vi.fn();
global.Audio = vi.fn().mockImplementation(() => ({
  play: mockPlay,
  pause: mockPause
}));

// Mock local storage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
  removeItem: vi.fn()
} as unknown as Storage;
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <UserProvider>
        <PomodoroProvider>
          <Toaster />
          {component}
        </PomodoroProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

describe('Pomodoro Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render initial timer state', () => {
    renderWithProviders(<Pomodoro />);
    
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();
  });

  it('should start timer when clicking start', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('24:59')).toBeInTheDocument();
  });

  it('should pause timer when clicking pause', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(startButton);
    const time = screen.getByText('24:55');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(time).toBeInTheDocument();
  });

  it('should reset timer when clicking reset', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });
    
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(resetButton);
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should switch to break mode after work session', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(screen.getByText('Break')).toBeInTheDocument();
    expect(screen.getByText('5:00')).toBeInTheDocument();
  });

  it('should switch back to work mode after break', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    // Complete work session
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    // Complete break session
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should play sound when session completes', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    expect(mockPlay).toHaveBeenCalled();
  });

  it('should not play sound when timer is reset', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });
    
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(resetButton);
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should increment completed sessions', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    // Complete work session
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    // Complete break session
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    expect(screen.getByText('Sessions: 1')).toBeInTheDocument();
  });

  it('should not increment on reset', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });
    
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    fireEvent.click(resetButton);
    expect(screen.getByText('Sessions: 0')).toBeInTheDocument();
  });

  it('should save settings to local storage', () => {
    renderWithProviders(<Pomodoro />);
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'pomodoroSettings',
      expect.any(String)
    );
  });

  it('should load settings from local storage', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(JSON.stringify({
      workDuration: 30,
      breakDuration: 10
    }));

    renderWithProviders(<Pomodoro />);
    expect(screen.getByText('30:00')).toBeInTheDocument();
  });
}); 