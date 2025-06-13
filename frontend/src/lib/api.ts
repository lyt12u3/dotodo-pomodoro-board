const API_URL = 'http://localhost:3000/api';

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
  const token = localStorage.getItem('accessToken');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[API] Calling ${endpoint}`, {
    method: options.method || 'GET',
    headers: defaultHeaders,
    body: options.body ? JSON.parse(options.body as string) : undefined,
  });

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  const data = await response.json();

  console.log(`[API] Response from ${endpoint}:`, {
    status: response.status,
    data,
  });

  if (response.status === 401 && !skipTokenRefresh) {
    console.log('[API] Unauthorized, attempting to refresh token...');
    // Only try to refresh if we have a token and it's not auth-related endpoints
    if (token && !endpoint.includes('/auth/')) {
      const refreshed = await refreshToken();
      if (refreshed) {
        console.log('[API] Token refreshed successfully, retrying request...');
        // Retry the original request with new token
        return apiFetch(endpoint, options, skipTokenRefresh);
      }
    }
    
    console.log('[API] Token refresh failed or not applicable, logging out...');
    // If refresh failed or not applicable, logout and redirect to login
    await logout();
    window.location.href = '/login?message=auth-required';
    throw new Error('Требуется авторизация. Пожалуйста, войдите или зарегистрируйтесь.');
  }

  if (!response.ok) {
    const error = data as ApiError;
    console.error(`[API] Error from ${endpoint}:`, error);
    throw new Error(error.message || 'An error occurred');
  }

  return data as T;
}

// Auth API
export async function login(email: string, password: string) {
  const response = await apiFetch<{ accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, true); // Skip token refresh for login
  localStorage.setItem('accessToken', response.accessToken);
  return response;
}

export async function register(email: string, password: string, name: string) {
  const response = await apiFetch<{ accessToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  }, true); // Skip token refresh for register
  localStorage.setItem('accessToken', response.accessToken);
  return response;
}

export async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' }, true); // Skip token refresh for logout
  } finally {
    localStorage.removeItem('accessToken');
  }
}

export async function refreshToken() {
  try {
    const response = await apiFetch<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    }, true); // Skip token refresh for refresh endpoint
    localStorage.setItem('accessToken', response.accessToken);
    return true;
  } catch {
    return false;
  }
}

// User API
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserSettings {
  theme: string;
  notifications: boolean;
  // Add other settings as needed
}

export async function getCurrentUser() {
  return apiFetch<User>('/users/me');
}

export async function getUserSettings() {
  return apiFetch<UserSettings>('/users/settings');
}

export async function updateUserSettings(settings: Partial<UserSettings>) {
  return apiFetch<UserSettings>('/users/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

// Tasks API
export type TaskCategory = 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'later';

export interface Task {
  id: string;
  title: string;
  name: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
}

export async function getTasks() {
  console.log('[API] Getting tasks...');
  const tasks = await apiFetch<Task[]>('/tasks');
  return tasks.map(task => ({
    ...task,
    title: task.name,
  }));
}

export async function getTask(id: string) {
  return apiFetch<Task>(`/tasks/${id}`);
}

export async function createTask(task: { title: string; category: TaskCategory; completed?: boolean }) {
  console.log('[API] Creating task:', task);
  const dto = {
    title: task.title,
    category: task.category,
    status: task.completed ? 'COMPLETED' : 'PENDING',
  };
  console.log('[API] Task DTO:', dto);
  const response = await apiFetch<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return {
    ...response,
    title: response.name,
  };
}

export async function updateTask(id: string, task: Partial<Task>) {
  const dto: any = { ...task };
  if ('title' in task) {
    dto.title = task.title;
    delete dto.name;
  }
  if ('completed' in task) {
    dto.status = task.completed ? 'COMPLETED' : 'PENDING';
    delete dto.completed;
  }
  const response = await apiFetch<Task>(`/tasks/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  return {
    ...response,
    title: response.name,
  };
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