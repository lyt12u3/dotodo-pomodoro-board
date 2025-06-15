import { create } from 'zustand';
import { Task, TaskStatus } from '../types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  incrementPomodoro: (taskId: string) => void;
  getTasksByStatus: (status: TaskStatus) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],

  addTask: (task: Task) => {
    set((state) => ({
      tasks: [...state.tasks, task]
    }));
  },

  updateTask: (task: Task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => 
        t.id === task.id ? task : t
      )
    }));
  },

  deleteTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId)
    }));
  },

  incrementPomodoro: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.map((t) => 
        t.id === taskId
          ? { ...t, completedPomodoros: t.completedPomodoros + 1 }
          : t
      )
    }));
  },

  getTasksByStatus: (status: TaskStatus) => {
    return get().tasks.filter((t) => t.status === status);
  }
})); 