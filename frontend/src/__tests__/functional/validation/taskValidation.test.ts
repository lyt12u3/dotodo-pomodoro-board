import { validateTask } from '../../../utils/validation';
import { Task } from '../../../types';

describe('Task Validation', () => {
  it('should validate a valid task', () => {
    const validTask: Task = {
      id: '1',
      title: 'Valid Task',
      description: 'This is a valid task',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(validTask);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject task with empty title', () => {
    const invalidTask: Task = {
      id: '1',
      title: '',
      description: 'Description',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(invalidTask);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  it('should reject task with too long title', () => {
    const invalidTask: Task = {
      id: '1',
      title: 'a'.repeat(101), // 101 characters
      description: 'Description',
      estimatedPomodoros: 3,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(invalidTask);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Title must be less than 100 characters');
  });

  it('should reject task with invalid pomodoro count', () => {
    const invalidTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      estimatedPomodoros: 0, // Invalid: must be > 0
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(invalidTask);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Estimated pomodoros must be greater than 0');
  });

  it('should reject task with completed pomodoros greater than estimated', () => {
    const invalidTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      estimatedPomodoros: 2,
      completedPomodoros: 3, // Invalid: more than estimated
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(invalidTask);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Completed pomodoros cannot exceed estimated pomodoros');
  });

  it('should reject task with invalid status', () => {
    const invalidTask: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      status: 'invalid-status' as any,
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(invalidTask);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid task status');
  });

  it('should sanitize task description', () => {
    const taskWithHtml: Task = {
      id: '1',
      title: 'Task',
      description: '<script>alert("xss")</script>Description with HTML',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: new Date().toISOString(),
    };

    const result = validateTask(taskWithHtml);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedTask?.description).toBe('Description with HTML');
  });

  it('should validate task dates', () => {
    const taskWithInvalidDate: Task = {
      id: '1',
      title: 'Task',
      description: 'Description',
      estimatedPomodoros: 2,
      completedPomodoros: 0,
      status: 'todo',
      createdAt: 'invalid-date',
    };

    const result = validateTask(taskWithInvalidDate);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid date format');
  });
}); 