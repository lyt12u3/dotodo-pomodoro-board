import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface PomodoroTimerProps {
  initialWorkTime?: number;
  initialBreakTime?: number;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  initialWorkTime = 25 * 60, // 25 minutes in seconds
  initialBreakTime = 5 * 60, // 5 minutes in seconds
}) => {
  const [timeLeft, setTimeLeft] = useState(initialWorkTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // If we're finishing a break, increment the cycle count
            if (isBreak) {
              setCycles((prevCycles) => prevCycles + 1);
              setTimeLeft(initialWorkTime);
              setIsBreak(false);
            } else {
              setTimeLeft(initialBreakTime);
              setIsBreak(true);
            }
            return prev === 0 ? (isBreak ? initialWorkTime : initialBreakTime) : 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, isBreak, initialWorkTime, initialBreakTime]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(initialWorkTime);
    setIsBreak(false);
  };

  const toggleMode = () => {
    setIsRunning(false);
    setIsBreak(!isBreak);
    setTimeLeft(isBreak ? initialWorkTime : initialBreakTime);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-6 max-w-sm mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">
          {isBreak ? 'Break Time' : 'Work Time'}
        </h2>
        <div className="text-4xl font-mono mb-6" data-testid="timer-display">
          {formatTime(timeLeft)}
        </div>
        <div className="space-x-4">
          <Button
            onClick={toggleTimer}
            data-testid={isRunning ? 'timer-pause' : 'timer-start'}
          >
            {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            onClick={resetTimer}
            variant="outline"
            data-testid="timer-reset"
          >
            <RotateCcw className="mr-2" />
            Reset
          </Button>
          <Button
            onClick={toggleMode}
            variant="outline"
            data-testid="timer-mode"
          >
            <SkipForward className="mr-2" />
            Mode
          </Button>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Cycles completed: <span data-testid="cycle-count">{cycles}</span>
        </div>
      </div>
    </Card>
  );
}; 