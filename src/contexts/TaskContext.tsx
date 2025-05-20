
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority | null;
  group: "today";
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTasks must be used within a TaskProvider");
  }
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Load tasks from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem("dototodo_tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("dototodo_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = (task: Omit<Task, "id">) => {
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === id ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
