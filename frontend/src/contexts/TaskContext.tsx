import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

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
  addTask: (task: Omit<Task, "id">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
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
          console.error("Ошибка загрузки задач:", error);
          setTasks([]);
          return;
        }
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error("Некорректный ответ сервера (ожидался массив):", data);
          setTasks([]);
        } else {
          setTasks(data);
        }
      })
      .catch(e => {
        console.error("Ошибка сети при загрузке задач:", e);
        setTasks([]);
      });
  }, [isAuthenticated, accessToken]);

  const addTask = async (task: Omit<Task, "id">) => {
    if (!accessToken) return;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(task),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    } else {
      const error = await res.json().catch(() => ({}));
      console.error("Ошибка при добавлении задачи:", error);
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
      console.error("Ошибка при обновлении задачи:", error);
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
      console.error("Ошибка при удалении задачи:", error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};
