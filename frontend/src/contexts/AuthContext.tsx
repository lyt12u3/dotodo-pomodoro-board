import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, login as apiLogin, logout as apiLogout, register as apiRegister, updateUserSettings } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, language?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser(true);
        setUser(userData);
        
        // If we're on login/register and have a user, redirect to dashboard
        if (userData && (location.pathname === '/login' || location.pathname === '/register')) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('[AuthContext] Failed to get current user:', error);
        setUser(null);
        
        // If we're not on login/register and have no user, redirect to login
        if (location.pathname !== '/login' && location.pathname !== '/register') {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    const { user: userData } = await apiLogin(email, password);
    setUser(userData);
    navigate('/dashboard', { replace: true });
  };

  const register = async (email: string, password: string, name: string, language: string = 'eng') => {
    const { user: userData } = await apiRegister(email, password, name);
    if (language !== 'eng') {
      await updateUserSettings({ language });
    }
    setUser(userData);
    navigate('/dashboard', { replace: true });
  };

  const logout = async () => {
    try {
      await apiLogout();
      // Clear any stored auth data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('lastEmail');
      setUser(null);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if the API call fails, clear local data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('lastEmail');
      setUser(null);
      navigate('/login', { replace: true });
    }
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
