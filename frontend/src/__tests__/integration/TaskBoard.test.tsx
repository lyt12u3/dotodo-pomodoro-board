import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskBoard } from '../../components/TaskBoard';
import { TaskProvider } from '../../contexts/TaskContext';

// Mock HTML5 drag and drop API
const mockDragStart = vi.fn();
const mockDragOver = vi.fn();
const mockDrop = vi.fn();

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'dragstart', {
    value: mockDragStart,
  });
  Object.defineProperty(HTMLElement.prototype, 'dragover', {
    value: mockDragOver,
  });
  Object.defineProperty(HTMLElement.prototype, 'drop', {
    value: mockDrop,
  });
});

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
    renderTaskBoard();
    
    // Create a new task
    const addButton = screen.getByRole('button', { name: /add task/i });
    await userEvent.click(addButton);
    
    const taskInput = screen.getByRole('textbox');
    await userEvent.type(taskInput, 'Test Task');
    await userEvent.keyboard('{Enter}');

    // Find the task in TODO column
    const todoColumn = screen.getByTestId('column-TODO');
    const task = within(todoColumn).getByText('Test Task');
    
    // Simulate drag start
    fireEvent.dragStart(task);
    
    // Find IN_PROGRESS column and simulate drop
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');
    fireEvent.dragOver(inProgressColumn);
    fireEvent.drop(inProgressColumn);

    // Verify task moved to IN_PROGRESS
    expect(within(inProgressColumn).getByText('Test Task')).toBeInTheDocument();
    expect(within(todoColumn).queryByText('Test Task')).not.toBeInTheDocument();
  });

  it('should handle multiple tasks being dragged simultaneously', async () => {
    renderTaskBoard();
    
    // Create multiple tasks
    const tasks = ['Task 1', 'Task 2', 'Task 3'];
    const addButton = screen.getByRole('button', { name: /add task/i });
    
    for (const taskName of tasks) {
      await userEvent.click(addButton);
      const taskInput = screen.getByRole('textbox');
      await userEvent.type(taskInput, taskName);
      await userEvent.keyboard('{Enter}');
    }

    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');
    
    // Drag tasks one by one quickly
    for (const taskName of tasks) {
      const task = within(todoColumn).getByText(taskName);
      fireEvent.dragStart(task);
      fireEvent.dragOver(inProgressColumn);
      fireEvent.drop(inProgressColumn);
    }

    // Verify all tasks moved correctly
    for (const taskName of tasks) {
      expect(within(inProgressColumn).getByText(taskName)).toBeInTheDocument();
      expect(within(todoColumn).queryByText(taskName)).not.toBeInTheDocument();
    }
  });

  it('should maintain task order after multiple drag and drop operations', async () => {
    renderTaskBoard();
    
    // Create tasks
    const tasks = ['First Task', 'Second Task', 'Third Task'];
    const addButton = screen.getByRole('button', { name: /add task/i });
    
    for (const taskName of tasks) {
      await userEvent.click(addButton);
      const taskInput = screen.getByRole('textbox');
      await userEvent.type(taskInput, taskName);
      await userEvent.keyboard('{Enter}');
    }

    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');
    const doneColumn = screen.getByTestId('column-DONE');

    // Move tasks between columns in different orders
    const moveTask = async (taskName: string, targetColumn: HTMLElement) => {
      const task = screen.getByText(taskName);
      fireEvent.dragStart(task);
      fireEvent.dragOver(targetColumn);
      fireEvent.drop(targetColumn);
    };

    // Complex movement pattern
    await moveTask('Second Task', inProgressColumn);
    await moveTask('First Task', doneColumn);
    await moveTask('Third Task', inProgressColumn);
    await moveTask('Second Task', doneColumn);

    // Verify final positions
    expect(within(todoColumn).queryByText(/Task/)).not.toBeInTheDocument();
    expect(within(inProgressColumn).getByText('Third Task')).toBeInTheDocument();
    expect(within(doneColumn).getByText('First Task')).toBeInTheDocument();
    expect(within(doneColumn).getByText('Second Task')).toBeInTheDocument();
  });

  it('should handle edge case with 100+ tasks', async () => {
    renderTaskBoard();
    
    // Create 100+ tasks
    const addButton = screen.getByRole('button', { name: /add task/i });
    
    for (let i = 1; i <= 105; i++) {
      await userEvent.click(addButton);
      const taskInput = screen.getByRole('textbox');
      await userEvent.type(taskInput, `Task ${i}`);
      await userEvent.keyboard('{Enter}');
    }

    const todoColumn = screen.getByTestId('column-TODO');
    const inProgressColumn = screen.getByTestId('column-IN_PROGRESS');

    // Verify all tasks were created
    expect(within(todoColumn).getAllByText(/Task \d+/)).toHaveLength(105);

    // Move some tasks to test performance
    const tasksToMove = [1, 50, 100].map(i => `Task ${i}`);
    
    for (const taskName of tasksToMove) {
      const task = within(todoColumn).getByText(taskName);
      fireEvent.dragStart(task);
      fireEvent.dragOver(inProgressColumn);
      fireEvent.drop(inProgressColumn);
    }

    // Verify moves were successful
    for (const taskName of tasksToMove) {
      expect(within(inProgressColumn).getByText(taskName)).toBeInTheDocument();
      expect(within(todoColumn).queryByText(taskName)).not.toBeInTheDocument();
    }
  });

  it('should handle rapid column switching with tasks', async () => {
    renderTaskBoard();
    
    // Create a task
    const addButton = screen.getByRole('button', { name: /add task/i });
    await userEvent.click(addButton);
    const taskInput = screen.getByRole('textbox');
    await userEvent.type(taskInput, 'Rapid Switch Task');
    await userEvent.keyboard('{Enter}');

    const task = screen.getByText('Rapid Switch Task');
    const columns = ['TODO', 'IN_PROGRESS', 'DONE'].map(id => 
      screen.getByTestId(`column-${id}`)
    );

    // Rapidly switch between columns
    for (let i = 0; i < 10; i++) {
      const targetColumn = columns[i % columns.length];
      fireEvent.dragStart(task);
      fireEvent.dragOver(targetColumn);
      fireEvent.drop(targetColumn);
    }

    // Verify task exists in exactly one column
    const columnWithTask = columns.find(column => 
      within(column).queryByText('Rapid Switch Task')
    );
    
    expect(columnWithTask).toBeTruthy();
    expect(
      columns
        .filter(col => col !== columnWithTask)
        .every(col => !within(col).queryByText('Rapid Switch Task'))
    ).toBe(true);
  });
}); 