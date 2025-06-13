import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const userData = await getCurrentUser(true); // Skip redirect on initialization
          setUser(userData);
        } catch (error) {
          console.log('[AuthContext] Failed to get current user, removing token');
          localStorage.removeItem('accessToken');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    await apiLogin(email, password);
    const userData = await getCurrentUser(); // Allow redirect after successful login
    setUser(userData);
  };

  const register = async (email: string, password: string, name: string) => {
    await apiRegister(email, password, name);
    const userData = await getCurrentUser(); // Allow redirect after successful registration
    setUser(userData);
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 