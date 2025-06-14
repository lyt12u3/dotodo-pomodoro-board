import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { PomodoroTimer } from '../../components/PomodoroTimer';
import { PomodoroProvider } from '../../contexts/PomodoroContext';

describe('Pomodoro Timer Stress Tests', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should handle rapid start/stop/reset operations', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });

    // Rapidly toggle start/reset 100 times
    for (let i = 0; i < 100; i++) {
      fireEvent.click(startButton);
      act(() => {
        vi.advanceTimersByTime(100); // Advance a bit
      });
      fireEvent.click(resetButton);
    }

    // Timer should be in a valid state
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('should handle long-running timer with many cycles', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    // Simulate 8 hours of continuous operation
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 60 * 1000);
    });

    // Should have completed multiple work/break cycles
    const cycleCount = screen.getByTestId('cycle-count');
    expect(Number(cycleCount.textContent)).toBeGreaterThan(12); // At least 12 cycles in 8 hours
  });

  it('should handle rapid mode switching under load', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const modeButton = screen.getByRole('button', { name: /mode/i });
    const startButton = screen.getByRole('button', { name: /start/i });

    // Start timer
    fireEvent.click(startButton);

    // Rapidly switch modes while timer is running
    for (let i = 0; i < 50; i++) {
      fireEvent.click(modeButton);
      act(() => {
        vi.advanceTimersByTime(100);
      });
    }

    // Timer should still be running and in a valid state
    const timeDisplay = screen.getByText(/\d{2}:\d{2}/);
    expect(timeDisplay).toBeInTheDocument();
  });

  it('should handle memory usage with many state updates', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });
    const modeButton = screen.getByRole('button', { name: /mode/i });

    // Create many state updates
    for (let i = 0; i < 1000; i++) {
      fireEvent.click(startButton);
      act(() => {
        vi.advanceTimersByTime(50);
      });
      if (i % 3 === 0) fireEvent.click(modeButton);
      if (i % 5 === 0) fireEvent.click(resetButton);
    }

    // Timer should still be responsive
    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('should handle concurrent operations', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    const modeButton = screen.getByRole('button', { name: /mode/i });

    // Simulate concurrent operations
    fireEvent.click(startButton);
    
    // Create multiple rapid state changes
    const operations = Array(10).fill(null).map((_, i) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          act(() => {
            fireEvent.click(modeButton);
            vi.advanceTimersByTime(100);
          });
          resolve();
        }, i * 10);
      });
    });

    await Promise.all(operations);

    // Timer should be in a consistent state
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('should handle extreme time values', async () => {
    render(
      <PomodoroProvider>
        <PomodoroTimer />
      </PomodoroProvider>
    );

    const startButton = screen.getByRole('button', { name: /start/i });
    fireEvent.click(startButton);

    // Advance timer by an extremely large value
    act(() => {
      vi.advanceTimersByTime(Number.MAX_SAFE_INTEGER);
    });

    // Timer should still be in a valid state
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument();
  });
}); 