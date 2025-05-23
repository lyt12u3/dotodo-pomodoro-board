import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type PomodoroSettings = {
  workInterval: number; // in minutes
  breakInterval: number; // in minutes
};

type PomodoroContextType = {
  settings: PomodoroSettings;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number; // in seconds
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  isWorkInterval: boolean;
  currentInterval: number;
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
  const [settings, setSettings] = useState<PomodoroSettings>({
    workInterval: 25,
    breakInterval: 5,
  });
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(settings.workInterval * 60);
  const [isWorkInterval, setIsWorkInterval] = useState(true);
  const [currentInterval, setCurrentInterval] = useState(1);

  // Load settings from localStorage
  useEffect(() => {
    const storedSettings = localStorage.getItem("dototodo_pomodoro");
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      setSettings(parsedSettings);
      if (!isActive) {
        setTimeRemaining(parsedSettings.workInterval * 60);
      }
    }
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem("dototodo_pomodoro", JSON.stringify(settings));
  }, [settings]);

  // Timer tick
  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive && !isPaused) {
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
  }, [isActive, isPaused]);

  const handleIntervalComplete = () => {
    if (isWorkInterval) {
      // Work interval finished
      setIsWorkInterval(false);
      setTimeRemaining(settings.breakInterval * 60);
    } else {
      // Break finished, start next work interval
      setIsWorkInterval(true);
      setTimeRemaining(settings.workInterval * 60);
      setCurrentInterval(prev => prev + 1);
    }
  };

  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
    } else if (isPaused) {
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    if (isActive && !isPaused) {
      setIsPaused(true);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsWorkInterval(true);
    setTimeRemaining(settings.workInterval * 60);
    setCurrentInterval(1);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      if (!isActive) {
        setTimeRemaining(updated.workInterval * 60);
      }
      return updated;
    });
  };

  return (
    <PomodoroContext.Provider
      value={{
        settings,
        updateSettings,
        isActive,
        isPaused,
        timeRemaining,
        startTimer,
        pauseTimer,
        resetTimer,
        isWorkInterval,
        currentInterval,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}; 