import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { PomodoroProvider } from '../contexts/PomodoroContext';
import { UserProvider } from '../contexts/UserContext';
import Pomodoro from '../pages/Pomodoro';
import { Toaster } from '../components/ui/toaster';

// Mock the contexts
jest.mock('../contexts/PomodoroContext', () => ({
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
    start: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    stop: jest.fn(),
    skip: jest.fn()
  }),
  PomodoroProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
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

const renderPomodoro = () => {
  render(
    <BrowserRouter>
      <UserProvider>
        <PomodoroProvider>
          <Pomodoro />
          <Toaster />
        </PomodoroProvider>
      </UserProvider>
    </BrowserRouter>
  );
};

describe('Pomodoro Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial pomodoro state', () => {
    renderPomodoro();
    
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText(/work time/i)).toBeInTheDocument();
    expect(screen.getByText(/interval 1 of 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  });

  test('handles start button click', () => {
    const { start } = require('../contexts/PomodoroContext').usePomodoro();
    renderPomodoro();
    
    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);
    
    expect(start).toHaveBeenCalled();
  });

  test('shows pause button when timer is running', () => {
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: false,
      currentInterval: 1,
      timeLeft: 1500,
      isWorkTime: true,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      skip: jest.fn()
    }));

    renderPomodoro();
    
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  test('shows resume button when timer is paused', () => {
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: true,
      currentInterval: 1,
      timeLeft: 1500,
      isWorkTime: true,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      skip: jest.fn()
    }));

    renderPomodoro();
    
    expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
  });

  test('handles pause button click', () => {
    const mockPause = jest.fn();
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: false,
      currentInterval: 1,
      timeLeft: 1500,
      isWorkTime: true,
      start: jest.fn(),
      pause: mockPause,
      resume: jest.fn(),
      stop: jest.fn(),
      skip: jest.fn()
    }));

    renderPomodoro();
    
    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);
    
    expect(mockPause).toHaveBeenCalled();
  });

  test('handles resume button click', () => {
    const mockResume = jest.fn();
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: true,
      currentInterval: 1,
      timeLeft: 1500,
      isWorkTime: true,
      start: jest.fn(),
      pause: jest.fn(),
      resume: mockResume,
      stop: jest.fn(),
      skip: jest.fn()
    }));

    renderPomodoro();
    
    const resumeButton = screen.getByRole('button', { name: /resume/i });
    fireEvent.click(resumeButton);
    
    expect(mockResume).toHaveBeenCalled();
  });

  test('handles skip button click', () => {
    const mockSkip = jest.fn();
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: false,
      currentInterval: 1,
      timeLeft: 1500,
      isWorkTime: true,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      skip: mockSkip
    }));

    renderPomodoro();
    
    const skipButton = screen.getByRole('button', { name: /skip/i });
    fireEvent.click(skipButton);
    
    expect(mockSkip).toHaveBeenCalled();
  });

  test('shows break time state', () => {
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: false,
      currentInterval: 1,
      timeLeft: 300, // 5 minutes in seconds
      isWorkTime: false,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      skip: jest.fn()
    }));

    renderPomodoro();
    
    expect(screen.getByText('05:00')).toBeInTheDocument();
    expect(screen.getByText(/break time/i)).toBeInTheDocument();
  });

  test('formats time correctly', () => {
    jest.spyOn(require('../contexts/PomodoroContext'), 'usePomodoro').mockImplementation(() => ({
      settings: {
        workInterval: 25,
        breakInterval: 5,
        intervalsCount: 4
      },
      isRunning: true,
      isPaused: false,
      currentInterval: 1,
      timeLeft: 65, // 1 minute and 5 seconds
      isWorkTime: true,
      start: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      stop: jest.fn(),
      skip: jest.fn()
    }));

    renderPomodoro();
    
    expect(screen.getByText('01:05')).toBeInTheDocument();
  });
}); 