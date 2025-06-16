type TaskPriority = 'high' | 'medium' | 'low';
type TaskCategory = 'work' | 'personal' | 'shopping' | 'health' | 'other';

/**
 * Validates task input data
 * @param text - The task text
 * @param priority - Optional task priority
 * @param dueDate - Optional task due date
 * @param category - Optional task category
 * @returns boolean indicating if the input is valid
 */
export function validateTaskInput(
  text: string | null | undefined,
  priority?: string,
  dueDate?: Date | null,
  category?: string
): boolean {
  // Validate text
  if (!text || typeof text !== 'string') {
    return false;
  }

  const trimmedText = text.trim();
  if (trimmedText.length === 0 || trimmedText.length > 255) {
    return false;
  }

  // Validate priority if provided
  if (priority !== undefined) {
    const validPriorities: TaskPriority[] = ['high', 'medium', 'low'];
    if (!validPriorities.includes(priority as TaskPriority)) {
      return false;
    }
  }

  // Validate due date if provided
  if (dueDate) {
    const now = new Date();
    // Reset time part for both dates to compare only dates
    const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (dueDateOnly < nowOnly) {
      return false;
    }
  }

  // Validate category if provided
  if (category !== undefined) {
    const validCategories: TaskCategory[] = ['work', 'personal', 'shopping', 'health', 'other'];
    if (!validCategories.includes(category as TaskCategory)) {
      return false;
    }
  }

  return true;
} 