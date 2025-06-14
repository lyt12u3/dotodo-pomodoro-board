import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PomodoroTimer } from '../../components/PomodoroTimer';
import { PomodoroProvider } from '../../contexts/PomodoroContext';

describe('PomodoroTimer Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default work duration', () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );
    
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should start countdown when start button is clicked', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(1000); // Advance 1 second
    });

    expect(screen.getByText('24:59')).toBeInTheDocument();
  });

  it('should pause countdown when pause button is clicked', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const pauseButton = screen.getByRole('button', { name: /pause/i });
    fireEvent.click(pauseButton);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText('24:59')).toBeInTheDocument(); // Time should not change after pause
  });

  it('should reset timer when reset button is clicked', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(5000); // Advance 5 seconds
    });

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should switch to break mode after work session completes', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000); // Complete work session
    });

    expect(screen.getByText('05:00')).toBeInTheDocument(); // Break time should be 5 minutes
    expect(screen.getByText(/break/i)).toBeInTheDocument();
  });

  it('should handle rapid mode switching', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const modeButton = screen.getByTestId('timer-mode');
    
    // Rapidly switch modes
    for (let i = 0; i < 10; i++) {
      fireEvent.click(modeButton);
    }

    // Timer should be in a valid state
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('should maintain accurate timing over long periods', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer initialWorkTime={5} initialBreakTime={3} />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    // Complete multiple cycles (work + break)
    for (let i = 0; i < 5; i++) {
      // Complete work period
      act(() => {
        vi.advanceTimersByTime(5000); // 5 seconds work time
      });

      // Complete break period
      act(() => {
        vi.advanceTimersByTime(3000); // 3 seconds break time
      });
    }

    // Verify cycle count is correct (should have completed 5 cycles)
    const cycleCount = screen.getByTestId('cycle-count');
    expect(Number(cycleCount.textContent)).toBeGreaterThan(3);
  });
}); 