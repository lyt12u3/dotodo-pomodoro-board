export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  status: TaskStatus;
  createdAt: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedTask?: Task;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface PomodoroSettings {
  workDuration: number;
  breakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
} 