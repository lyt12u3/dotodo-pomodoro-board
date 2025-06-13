import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type Priority = "low" | "medium" | "high";
export type TaskCategory = "today" | "tomorrow" | "this-week" | "next-week" | "later";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  category: TaskCategory;
  dueDate?: string;
};

type TaskContextType = {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  getTasksByCategory: (category: TaskCategory) => Task[];
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
  const { accessToken, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setTasks([]);
      return;
    }
    console.log("accessToken:", accessToken);
    fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async res => {
        if (!res.ok) {
          const error = await res.json().catch(() => ({}));
          console.error("Error loading tasks:", error);
          setTasks([]);
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Invalid server response (expected array):", data);
          setTasks([]);
        } else {
          setTasks(data);
        }
      })
      .catch(e => {
        console.error("Network error while loading tasks:", e);
        setTasks([]);
      });
  }, [isAuthenticated, accessToken]);

  const addTask = async (task: Omit<Task, "id">) => {
    if (!accessToken) return;
    const dto: any = {
      title: task.title,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
    };
    if (typeof task.completed === "boolean") {
      dto.status = task.completed ? "COMPLETED" : "PENDING";
    }
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dto),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    } else {
      const error = await res.json().catch(() => ({}));
      console.error("Error adding task:", error);
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    if (!accessToken) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } else {
      const error = await res.json().catch(() => ({}));
      console.error("Error updating task:", error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!accessToken) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      const error = await res.json().catch(() => ({}));
      console.error("Error deleting task:", error);
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  const getTasksByCategory = (category: TaskCategory) => {
    return tasks.filter(task => task.category === category);
  };

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      updateTask, 
      deleteTask,
      toggleTaskCompleted,
      getTasksByCategory,
    }}>
      {children}
    </TaskContext.Provider>
  );
};
