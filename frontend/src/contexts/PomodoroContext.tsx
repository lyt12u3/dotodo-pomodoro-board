import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PomodoroSession, createPomodoroSession, updatePomodoroSession } from '../lib/api';

interface PomodoroSettings {
  workInterval: number;
  breakInterval: number;
  intervalsCount: number;
}

interface PomodoroContextType {
  timeRemaining: number;
  isRunning: boolean;
  isBreak: boolean;
  currentInterval: number;
  settings: PomodoroSettings;
  startTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  skipToNextInterval: () => Promise<void>;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  workTime: number;
  breakTime: number;
  setWorkTime: (time: number) => void;
  setBreakTime: (time: number) => void;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workInterval: 25,
  breakInterval: 5,
  intervalsCount: 4,
};

const PomodoroContext = createContext<PomodoroContextType | null>(null);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    try {
      const saved = localStorage.getItem('pomodoroSettings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Failed to parse pomodoro settings:', error);
      return DEFAULT_SETTINGS;
    }
  });

  const [timeRemaining, setTimeRemaining] = useState(settings.workInterval * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [currentInterval, setCurrentInterval] = useState(1);
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null);
  const [workTime, setWorkTime] = useState(settings.workInterval * 60);
  const [breakTime, setBreakTime] = useState(settings.breakInterval * 60);

  useEffect(() => {
    try {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save pomodoro settings:', error);
    }
  }, [settings]);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleIntervalComplete();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeRemaining]);

  const handleIntervalComplete = async () => {
    if (currentSession) {
      await updatePomodoroSession(currentSession.id, {
        endTime: new Date().toISOString(),
        completed: true,
      });
    }

    if (isBreak) {
      setIsBreak(false);
      setTimeRemaining(settings.workInterval * 60);
      if (currentInterval < settings.intervalsCount) {
        setCurrentInterval(prev => prev + 1);
      }
      setIsRunning(true);
    } else {
      setIsBreak(true);
      setTimeRemaining(settings.breakInterval * 60);
      setIsRunning(true);
    }
  };

  const startTimer = async () => {
    if (!isRunning) {
      setIsRunning(true);
      if (!isBreak) {
        const session = await createPomodoroSession({
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + timeRemaining * 1000).toISOString(),
          duration: timeRemaining,
          completed: false,
          taskId: '', // You might want to add task selection functionality
        });
        setCurrentSession(session);
      }
    }
  };

  const pauseTimer = async () => {
    if (isRunning) {
      setIsRunning(false);
      if (currentSession) {
        await updatePomodoroSession(currentSession.id, {
          endTime: new Date().toISOString(),
          completed: false,
        });
        setCurrentSession(null);
      }
    }
  };

  const skipToNextInterval = async () => {
    if (currentSession) {
      await updatePomodoroSession(currentSession.id, {
        endTime: new Date().toISOString(),
        completed: false,
      });
      setCurrentSession(null);
    }
    setTimeRemaining(0);
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    if (!isRunning) {
      setTimeRemaining((isBreak ? newSettings.breakInterval || settings.breakInterval : newSettings.workInterval || settings.workInterval) * 60);
    }
  };

  return (
    <PomodoroContext.Provider
      value={{
        timeRemaining,
        isRunning,
        isBreak,
        currentInterval,
        settings,
        startTimer,
        pauseTimer,
        skipToNextInterval,
        updateSettings,
        workTime,
        breakTime,
        setWorkTime,
        setBreakTime,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}; 