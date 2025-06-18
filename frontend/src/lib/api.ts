const API_URL = 'api';

interface ApiError {
  message: string;
  statusCode: number;
}

// Base fetch function with auth and error handling
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  skipTokenRefresh = false
): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for sending cookies
  });

  if (!response.ok) {
    if (response.status === 401 && !skipTokenRefresh) {
      // Only try to refresh if it's not auth-related endpoints
      if (!endpoint.includes('/auth/')) {
        try {
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry the original request
            return apiFetch(endpoint, options, true);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
      
      // If refresh failed or not applicable, logout and redirect to login
      await logout();
      
      // Only redirect if we're not already on login/register pages
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = '/login?message=auth-required';
      }
      
      throw new Error('Требуется авторизация. Пожалуйста, войдите или зарегистрируйтесь.');
    }

    const data = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(data.message || 'An error occurred');
  }

  return response.json();
}

// Auth API
export async function login(email: string, password: string) {
  const response = await apiFetch<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, true);
  return response;
}

export async function register(email: string, password: string, name: string) {
  const response = await apiFetch<{ user: User }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }, true);
  return response;
}

export async function logout() {
  await apiFetch('/auth/logout', {
    method: 'POST',
  }, true);
}

export async function refreshToken() {
  try {
    await apiFetch<void>('/auth/refresh', {
      method: 'POST',
    }, true);
    return true;
  } catch {
    return false;
  }
}

// User API
export interface User {
  id: string;
  email: string;
  name: string | null;
  language: string;
}

export interface UserSettings {
  name?: string;
  language?: string;
  workInterval: number;
  breakInterval: number;
  intervalsCount: number;
}

export async function getCurrentUser(skipRedirect = false) {
  return apiFetch<User>('/users/me', {}, skipRedirect);
}

export async function getUserSettings(skipRedirect = false) {
  return apiFetch<UserSettings>('/users/settings', {}, skipRedirect);
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  return apiFetch<UserSettings>('/users/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

// Tasks API
export type TaskCategory = 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'later';

export interface Task {
  id: string;
  title: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  isCompleted?: boolean;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
  priority?: 'low' | 'medium' | 'high';
}

// Transform backend task to frontend format
function transformTaskResponse(task: any): Task {
  return {
    ...task,
    title: task.name,
    status: task.isCompleted ? 'COMPLETED' : 'PENDING'
  };
}
export async function getTask(id: string) {
  const task = await apiFetch<Task>(`/tasks/${id}`);
  return transformTaskResponse(task);
}

export async function createTask(task: { title: string; category: TaskCategory; completed?: boolean; priority?: 'low' | 'medium' | 'high' }) {
  console.log('[API] Creating task:', task);
  const dto = {
    name: task.title,
    category: task.category,
    isCompleted: task.completed,
    priority: task.priority
  };
  
  console.log('[API] Task DTO:', dto);
  const response = await apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  
  return transformTaskResponse(response);
}

export async function updateTask(id: string, task: Partial<Task>) {
  console.log('[API] Updating task:', { id, task });
  const dto: any = {};
  
  if ('title' in task) {
    dto.title = task.title;
  }
  
  if ('status' in task) {
    dto.isCompleted = task.status === 'COMPLETED';
  }

  if ('priority' in task) {
    dto.priority = task.priority;
  }

  if ('category' in task) {
    dto.category = task.category;
  }
  
  console.log('[API] Task DTO to send:', dto);
  const response = await apiFetch<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  
  return transformTaskResponse(response);
}

export async function deleteTask(id: string) {
  return apiFetch<void>(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

// Pomodoro Sessions API
export interface PomodoroSession {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  completed: boolean;
  status: 'STARTED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
}

export async function getPomodoroSessions() {
  return apiFetch<PomodoroSession[]>('/pomodoro-sessions');
}

export async function getPomodoroSession(id: string) {
  return apiFetch<PomodoroSession>(`/pomodoro-sessions/${id}`);
}

export async function createPomodoroSession(session: Omit<PomodoroSession, 'id'>) {
  return apiFetch<PomodoroSession>('/pomodoro-sessions', {
    method: 'POST',
    body: JSON.stringify(session),
  });
}

export async function updatePomodoroSession(id: string, session: Partial<PomodoroSession>) {
  return apiFetch<PomodoroSession>(`/pomodoro-sessions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(session),
  });
}

export async function deletePomodoroSession(id: string) {
  return apiFetch<void>(`/pomodoro-sessions/${id}`, {
    method: 'DELETE',
  });
}

export async function getTasks() {
  console.log('[API] Getting tasks...');
  const tasks = await apiFetch<Task[]>('/tasks');
  return tasks.map(transformTaskResponse);
}
