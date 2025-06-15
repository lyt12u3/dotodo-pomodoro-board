import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Toaster, toast } from 'sonner';

/**
 * Test suite for Toast Context
 * Tests the toast notification system including:
 * - Toast creation and display
 * - Different toast types (success, error, info)
 * - Toast dismissal
 * - Multiple toasts handling
 */

const TestComponent = () => {
  return (
    <div>
      <button onClick={() => toast.success('Success message')}>Show Success</button>
      <button onClick={() => toast.error('Error message')}>Show Error</button>
      <button onClick={() => toast.info('Info message')}>Show Info</button>
      <Toaster />
    </div>
  );
};

describe('Toast Notifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should show success toast', async () => {
    render(<TestComponent />);
    
    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should show error toast', async () => {
    render(<TestComponent />);
    
    const errorButton = screen.getByText('Show Error');
    fireEvent.click(errorButton);

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should show info toast', async () => {
    render(<TestComponent />);
    
    const infoButton = screen.getByText('Show Info');
    fireEvent.click(infoButton);

    expect(screen.getByText('Info message')).toBeInTheDocument();
  });

  it('should handle multiple toasts', async () => {
    render(<TestComponent />);
    
    const successButton = screen.getByText('Show Success');
    const errorButton = screen.getByText('Show Error');
    
    fireEvent.click(successButton);
    fireEvent.click(errorButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should auto-dismiss toast after timeout', async () => {
    render(<TestComponent />);
    
    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    expect(screen.getByText('Success message')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('should allow manual toast dismissal', async () => {
    render(<TestComponent />);
    
    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    const toast = screen.getByText('Success message');
    const closeButton = toast.parentElement?.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(screen.queryByText('Success message')).not.toBeInTheDocument();
  });

  it('should position toasts correctly', async () => {
    render(<TestComponent />);
    
    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    const toast = screen.getByText('Success message');
    const toastContainer = toast.parentElement?.parentElement;
    expect(toastContainer).toHaveClass('fixed');
  });

  it('should be accessible', async () => {
    render(<TestComponent />);
    
    const successButton = screen.getByText('Show Success');
    fireEvent.click(successButton);

    const toast = screen.getByRole('status');
    expect(toast).toBeInTheDocument();
  });
}); 