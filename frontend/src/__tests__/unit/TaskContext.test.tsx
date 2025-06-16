import { render, act, renderHook } from '@testing-library/react';
import { TaskProvider, useTasks } from '../../contexts/TaskContext';
import { TaskCategory } from '../../lib/api';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the API functions
vi.mock('../../lib/api', () => ({
  createTask: vi.fn(),
  getTasks: vi.fn().mockResolvedValue([]), // Mock getTasks to return empty array by default
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

describe('TaskContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should add a new task successfully', async () => {
    // Mock the API response
    const mockTask = {
      id: '1',
      name: 'Test Task',
      title: 'Test Task',
      status: 'PENDING',
      category: 'today' as TaskCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: 'medium' as const,
    };

    const { createTask, getTasks } = await import('../../lib/api');
    createTask.mockResolvedValueOnce(mockTask);
    getTasks.mockResolvedValueOnce([]); // Mock initial tasks load

    // Create a wrapper component to test the context
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    // Render the hook
    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for initial tasks load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Add a new task
    await act(async () => {
      await result.current.addTask({
        title: 'Test Task',
        category: 'today',
        priority: 'medium',
      });
    });

    // Verify the task was added
    expect(createTask).toHaveBeenCalledWith({
      title: 'Test Task',
      category: 'today',
      priority: 'medium',
    });

    // Verify the task is in the context
    const tasks = result.current.getTasksByCategory('today');
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toEqual({
      ...mockTask,
      completed: false,
    });
  });

  it('should handle task addition error', async () => {
    // Mock the API error
    const { createTask, getTasks } = await import('../../lib/api');
    createTask.mockRejectedValueOnce(new Error('Failed to create task'));
    getTasks.mockResolvedValueOnce([]); // Mock initial tasks load

    // Create a wrapper component
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TaskProvider>{children}</TaskProvider>
    );

    // Render the hook
    const { result } = renderHook(() => useTasks(), { wrapper });

    // Wait for initial tasks load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Try to add a task and expect it to throw
    await expect(
      act(async () => {
        await result.current.addTask({
          title: 'Test Task',
          category: 'today',
        });
      })
    ).rejects.toThrow('Failed to create task');

    // Verify no tasks were added
    const tasks = result.current.getTasksByCategory('today');
    expect(tasks).toHaveLength(0);
  });
}); 