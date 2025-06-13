import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings, getUserSettings, updateUserSettings as apiUpdateUserSettings } from '../lib/api';

interface UserContextType {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const userSettings = await getUserSettings(true); // Skip redirect on initialization
        setSettings(userSettings);
      } catch (error) {
        console.log('[UserContext] Failed to load user settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      const updatedSettings = await apiUpdateUserSettings(newSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Failed to update user settings:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ settings, isLoading, updateSettings }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 