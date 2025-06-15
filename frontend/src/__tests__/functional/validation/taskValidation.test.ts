import { validateTaskInput } from '../../../utils/validation';

describe('Task validation', () => {
  it('should reject empty task', () => {
    expect(validateTaskInput('')).toBe(false);
    expect(validateTaskInput('   ')).toBe(false);
  });

  it('should allow valid task text', () => {
    expect(validateTaskInput('Do homework')).toBe(true);
    expect(validateTaskInput('Buy groceries')).toBe(true);
    expect(validateTaskInput('Call mom')).toBe(true);
  });

  it('should reject very long tasks', () => {
    const longTask = 'A'.repeat(300);
    expect(validateTaskInput(longTask)).toBe(false);
  });

  it('should handle special characters', () => {
    expect(validateTaskInput('Task with @#$%')).toBe(true);
    expect(validateTaskInput('Task with emoji 🎯')).toBe(true);
  });

  it('should validate task priority', () => {
    expect(validateTaskInput('Task', 'high')).toBe(true);
    expect(validateTaskInput('Task', 'medium')).toBe(true);
    expect(validateTaskInput('Task', 'low')).toBe(true);
    expect(validateTaskInput('Task', 'invalid')).toBe(false);
  });

  it('should validate task dates', () => {
    const pastDate = new Date(2020, 0, 1);
    const futureDate = new Date(2025, 0, 1);
    const today = new Date();

    expect(validateTaskInput('Task', 'low', pastDate)).toBe(false);
    expect(validateTaskInput('Task', 'low', futureDate)).toBe(true);
    expect(validateTaskInput('Task', 'low', today)).toBe(true);
  });

  it('should handle null and undefined inputs', () => {
    expect(validateTaskInput(null)).toBe(false);
    expect(validateTaskInput(undefined)).toBe(false);
  });

  it('should validate task categories', () => {
    expect(validateTaskInput('Task', 'low', null, 'work')).toBe(true);
    expect(validateTaskInput('Task', 'low', null, 'personal')).toBe(true);
    expect(validateTaskInput('Task', 'low', null, 'invalid')).toBe(false);
  });
}); 