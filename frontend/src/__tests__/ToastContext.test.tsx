import { render, screen, fireEvent } from '@testing-library/react';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

// Test component that uses toast context
const TestComponent = () => {
  const { toast } = useToast();
  
  const showSuccessToast = () => {
    toast({
      title: 'Success',
      description: 'Operation completed successfully'
    });
  };

  const showErrorToast = () => {
    toast({
      title: 'Error',
      description: 'Something went wrong',
      variant: 'destructive'
    });
  };

  return (
    <div>
      <button onClick={showSuccessToast}>Show Success Toast</button>
      <button onClick={showErrorToast}>Show Error Toast</button>
      <Toaster />
    </div>
  );
};

describe('ToastContext', () => {
  const renderWithToast = () => {
    return render(<TestComponent />);
  };

  test('shows success toast', () => {
    renderWithToast();
    
    const successButton = screen.getByText('Show Success Toast');
    fireEvent.click(successButton);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
  });

  test('shows error toast', () => {
    renderWithToast();
    
    const errorButton = screen.getByText('Show Error Toast');
    fireEvent.click(errorButton);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('can show multiple toasts', () => {
    renderWithToast();
    
    const successButton = screen.getByText('Show Success Toast');
    const errorButton = screen.getByText('Show Error Toast');
    
    fireEvent.click(successButton);
    fireEvent.click(errorButton);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
}); 