import { Task, ValidationResult, TaskStatus } from '../types';
import DOMPurify from 'dompurify';

const VALID_STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export function validateTask(task: Task): ValidationResult {
  const errors: string[] = [];
  let sanitizedTask: Task | undefined;

  // Validate title
  if (!task.title.trim()) {
    errors.push('Title is required');
  } else if (task.title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }

  // Validate pomodoro counts
  if (task.estimatedPomodoros <= 0) {
    errors.push('Estimated pomodoros must be greater than 0');
  }

  if (task.completedPomodoros < 0) {
    errors.push('Completed pomodoros cannot be negative');
  }

  if (task.completedPomodoros > task.estimatedPomodoros) {
    errors.push('Completed pomodoros cannot exceed estimated pomodoros');
  }

  // Validate status
  if (!VALID_STATUSES.includes(task.status)) {
    errors.push('Invalid task status');
  }

  // Validate date
  try {
    const date = new Date(task.createdAt);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
  } catch {
    errors.push('Invalid date format');
  }

  // Sanitize description if task is otherwise valid
  if (errors.length === 0) {
    sanitizedTask = {
      ...task,
      description: DOMPurify.sanitize(task.description, {
        ALLOWED_TAGS: [], // Strip all HTML
        ALLOWED_ATTR: [] // Strip all attributes
      })
    };
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedTask
  };
} 