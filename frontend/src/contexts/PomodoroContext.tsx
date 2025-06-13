import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

type PomodoroSettings = {
  workInterval: number; // in minutes
  shortBreakInterval: number; // in minutes
  longBreakInterval: number; // in minutes
  intervalsUntilLongBreak: number;
};

type PomodoroContextType = {
  settings: PomodoroSettings;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  isRunning: boolean;
  isBreak: boolean;
  timeRemaining: number; // in seconds
  currentInterval: number;
  startTimer: () => void;
  pauseTimer: () => void;
  skipToNextInterval: () => void;
};

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error("usePomodoro must be used within a PomodoroProvider");
  }
  return context;
};

export const PomodoroProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<PomodoroSettings>({
    workInterval: 25,
    shortBreakInterval: 5,
    longBreakInterval: 15,
    intervalsUntilLongBreak: 4,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(settings.workInterval * 60);
  const [currentInterval, setCurrentInterval] = useState(1);

  // Load settings from backend if authenticated
  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    fetch(`${import.meta.env.VITE_API_URL}/api/users/settings`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data.workInterval === "number") {
          setSettings({
            workInterval: data.workInterval,
            shortBreakInterval: data.shortBreakInterval || settings.shortBreakInterval,
            longBreakInterval: data.longBreakInterval || settings.longBreakInterval,
            intervalsUntilLongBreak: data.intervalsUntilLongBreak || settings.intervalsUntilLongBreak,
          });
          if (!isRunning) {
            setTimeRemaining(data.workInterval * 60);
          }
        }
      })
      .catch(() => {});
  }, [isAuthenticated, accessToken]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("dototodo_pomodoro", JSON.stringify(settings));
  }, [settings]);

  // Timer tick
  useEffect(() => {
    let interval: number | null = null;
    
    if (isRunning) {
      interval = window.setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            handleIntervalComplete();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleIntervalComplete = () => {
    if (!isBreak) {
      // Work interval finished
      setIsBreak(true);
      const isLongBreak = currentInterval >= settings.intervalsUntilLongBreak;
      setTimeRemaining(
        (isLongBreak ? settings.longBreakInterval : settings.shortBreakInterval) * 60
      );
    } else {
      // Break finished
      setIsBreak(false);
      setTimeRemaining(settings.workInterval * 60);
      if (currentInterval >= settings.intervalsUntilLongBreak) {
        setCurrentInterval(1);
      } else {
        setCurrentInterval(prev => prev + 1);
      }
    }
  };

  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const skipToNextInterval = () => {
    handleIntervalComplete();
    setIsRunning(false);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (!isRunning) {
        setTimeRemaining(updated.workInterval * 60);
      }
      // If authenticated, send to server
      if (isAuthenticated && accessToken) {
        fetch(`${import.meta.env.VITE_API_URL}/api/users/settings`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(newSettings),
        }).catch(() => {});
      }
      return updated;
    });
  };

  return (
    <PomodoroContext.Provider
      value={{
        settings,
        updateSettings,
        isRunning,
        isBreak,
        timeRemaining,
        currentInterval,
        startTimer,
        pauseTimer,
        skipToNextInterval,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}; 