import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Task as ApiTask, TaskCategory, getTasks, createTask, updateTask, deleteTask as apiDeleteTask } from '../lib/api';

export type Priority = 'low' | 'medium' | 'high';
export type { TaskCategory };

export interface Task extends Omit<ApiTask, 'status' | 'name'> {
  completed: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: { title: string; category: TaskCategory; completed?: boolean }) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByCategory: (category: TaskCategory) => Task[];
}

const TaskContext = createContext<TaskContextType | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loadTasks = async () => {
      console.log('[TaskContext] Loading tasks...');
      try {
        const tasksData = await getTasks();
        console.log('[TaskContext] Received tasks:', tasksData);
        
        // Convert API tasks to our internal format
        const convertedTasks = tasksData.map(task => ({
          ...task,
          completed: task.status === 'COMPLETED',
        })) as Task[];
        
        console.log('[TaskContext] Converted tasks:', convertedTasks);
        setTasks(convertedTasks);
      } catch (error) {
        console.error('[TaskContext] Failed to load tasks:', error);
      }
    };

    loadTasks();
  }, []);

  const addTask = async (task: { title: string; category: TaskCategory; completed?: boolean }) => {
    console.log('[TaskContext] Adding task:', task);
    try {
      const apiTask = await createTask({
        title: task.title,
        completed: task.completed,
        category: task.category,
      });
      
      console.log('[TaskContext] API response:', apiTask);
      
      const newTask: Task = {
        ...apiTask,
        completed: apiTask.status === 'COMPLETED',
      };
      
      console.log('[TaskContext] New task:', newTask);
      setTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('[TaskContext] Failed to add task:', error);
      throw error;
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    console.log('[TaskContext] Toggling task completion:', id);
    const task = tasks.find(t => t.id === id);
    if (!task) {
      console.error('[TaskContext] Task not found:', id);
      return;
    }

    try {
      const updatedApiTask = await updateTask(id, { status: task.completed ? 'PENDING' : 'COMPLETED' });
      console.log('[TaskContext] API response:', updatedApiTask);
      
      const updatedTask: Task = {
        ...updatedApiTask,
        completed: updatedApiTask.status === 'COMPLETED',
      };
      
      console.log('[TaskContext] Updated task:', updatedTask);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
    } catch (error) {
      console.error('[TaskContext] Failed to toggle task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    console.log('[TaskContext] Deleting task:', id);
    try {
      await apiDeleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      console.log('[TaskContext] Task deleted:', id);
    } catch (error) {
      console.error('[TaskContext] Failed to delete task:', error);
      throw error;
    }
  };

  const getTasksByCategory = (category: TaskCategory) => {
    const filteredTasks = tasks.filter(task => task.category === category);
    console.log(`[TaskContext] Tasks for category ${category}:`, filteredTasks);
    return filteredTasks;
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTaskCompleted, deleteTask, getTasksByCategory }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
