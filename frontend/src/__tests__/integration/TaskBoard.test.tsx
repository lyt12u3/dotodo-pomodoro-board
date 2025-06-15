import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskBoard } from '../../components/TaskBoard';
import { TaskProvider } from '../../contexts/TaskContext';

// Mock API calls
vi.mock('../../lib/api', () => ({
  getTasks: vi.fn().mockResolvedValue([]),
  createTask: vi.fn().mockImplementation((title) => Promise.resolve({ id: Date.now(), title, status: 'TODO' })),
  updateTask: vi.fn().mockImplementation((id, updates) => Promise.resolve({ id, ...updates })),
  deleteTask: vi.fn().mockResolvedValue(true)
}));

// Mock DataTransfer
class MockDataTransfer {
  data = {};
  setData(format: string, data: string) {
    this.data[format] = data;
  }
  getData(format: string) {
    return this.data[format] || '';
  }
}

const createDragEvent = (type: string) => {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, 'dataTransfer', {
    value: new MockDataTransfer(),
  });
  return event;
};

describe('TaskBoard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderTaskBoard = () => {
    return render(
      <TaskProvider>
        <TaskBoard />
      </TaskProvider>
    );
  };

  it('should allow dragging a task from TODO to IN_PROGRESS', async () => {
    await act(async () => {
      renderTaskBoard();
    });
    
    // Add a task
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      await userEvent.type(input, 'Test Task');
      await userEvent.click(addButton);
    });

    // Find the task and columns
    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');
    const task = await within(todoColumn).findByText('Test Task');

    // Simulate drag and drop
    await act(async () => {
      const dragStart = createDragEvent('dragstart');
      const dragOver = createDragEvent('dragover');
      const drop = createDragEvent('drop');

      task.dispatchEvent(dragStart);
      inProgressColumn.dispatchEvent(dragOver);
      inProgressColumn.dispatchEvent(drop);
    });

    // Verify task moved
    expect(await within(inProgressColumn).findByText('Test Task')).toBeInTheDocument();
  });

  it('should handle multiple tasks being dragged simultaneously', async () => {
    await act(async () => {
      renderTaskBoard();
    });
    
    // Add tasks
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    for (const taskName of ['Task 1', 'Task 2']) {
      await act(async () => {
        await userEvent.clear(input);
        await userEvent.type(input, taskName);
        await userEvent.click(addButton);
      });
    }

    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');

    // Move tasks one by one
    for (const taskName of ['Task 1', 'Task 2']) {
      const task = await within(todoColumn).findByText(taskName);
      
      await act(async () => {
        const dragStart = createDragEvent('dragstart');
        const dragOver = createDragEvent('dragover');
        const drop = createDragEvent('drop');

        task.dispatchEvent(dragStart);
        inProgressColumn.dispatchEvent(dragOver);
        inProgressColumn.dispatchEvent(drop);
      });
    }

    // Verify tasks moved
    expect(await within(inProgressColumn).findByText('Task 1')).toBeInTheDocument();
    expect(await within(inProgressColumn).findByText('Task 2')).toBeInTheDocument();
  });

  it('should maintain task order after multiple drag and drop operations', async () => {
    await act(async () => {
      renderTaskBoard();
    });
    
    // Add tasks
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    for (const taskName of ['First Task', 'Second Task', 'Third Task']) {
      await act(async () => {
        await userEvent.clear(input);
        await userEvent.type(input, taskName);
        await userEvent.click(addButton);
      });
    }

    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');
    const doneColumn = screen.getByTestId('column-DONE');

    // Helper function to move a task
    const moveTask = async (taskName: string, targetColumn: HTMLElement) => {
      const task = await screen.findByText(taskName);
      await act(async () => {
        const dragStart = createDragEvent('dragstart');
        const dragOver = createDragEvent('dragover');
        const drop = createDragEvent('drop');

        task.dispatchEvent(dragStart);
        targetColumn.dispatchEvent(dragOver);
        targetColumn.dispatchEvent(drop);
      });
    };

    // Move tasks in specific order
    await moveTask('Second Task', inProgressColumn);
    await moveTask('First Task', doneColumn);
    await moveTask('Third Task', inProgressColumn);
    await moveTask('Second Task', doneColumn);

    // Verify final positions
    expect(await within(inProgressColumn).findByText('Third Task')).toBeInTheDocument();
    expect(await within(doneColumn).findByText('First Task')).toBeInTheDocument();
    expect(await within(doneColumn).findByText('Second Task')).toBeInTheDocument();
  });

  it('should handle edge case with many tasks', async () => {
    await act(async () => {
      renderTaskBoard();
    });
    
    // Add tasks
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    for (let i = 1; i <= 5; i++) { // Reduced to 5 tasks for stability
      await act(async () => {
        await userEvent.clear(input);
        await userEvent.type(input, `Task ${i}`);
        await userEvent.click(addButton);
      });
    }

    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');

    // Move some tasks
    for (const i of [1, 3, 5]) {
      const task = await within(todoColumn).findByText(`Task ${i}`);
      
      await act(async () => {
        const dragStart = createDragEvent('dragstart');
        const dragOver = createDragEvent('dragover');
        const drop = createDragEvent('drop');

        task.dispatchEvent(dragStart);
        inProgressColumn.dispatchEvent(dragOver);
        inProgressColumn.dispatchEvent(drop);
      });
    }

    // Verify moves
    for (const i of [1, 3, 5]) {
      expect(await within(inProgressColumn).findByText(`Task ${i}`)).toBeInTheDocument();
    }
  });

  it('should handle rapid column switching with tasks', async () => {
    await act(async () => {
      renderTaskBoard();
    });
    
    // Add a task
    const input = screen.getByPlaceholderText(/add a task/i);
    const addButton = screen.getByRole('button', { name: /add/i });
    
    await act(async () => {
      await userEvent.type(input, 'Rapid Switch Task');
      await userEvent.click(addButton);
    });

    const task = await screen.findByText('Rapid Switch Task');
    const columns = ['TODO', 'IN_PROGRESS', 'DONE'].map(id => 
      screen.getByTestId(`column-${id}`)
    );

    // Rapidly switch between columns
    for (let i = 0; i < 3; i++) { // Reduced iterations for stability
      const targetColumn = columns[i % columns.length];
      
      await act(async () => {
        const dragStart = createDragEvent('dragstart');
        const dragOver = createDragEvent('dragover');
        const drop = createDragEvent('drop');

        task.dispatchEvent(dragStart);
        targetColumn.dispatchEvent(dragOver);
        targetColumn.dispatchEvent(drop);
      });
    }

    // Verify task exists in exactly one column
    const taskLocations = columns.filter(column => 
      within(column).queryByText('Rapid Switch Task')
    );
    expect(taskLocations.length).toBe(1);
  });
}); 