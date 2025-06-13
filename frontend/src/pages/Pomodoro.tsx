import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { usePomodoro } from '../contexts/PomodoroContext';
import { Play, Pause, SkipForward } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const Pomodoro = () => {
  const { 
    timeRemaining, 
    isRunning, 
    isBreak, 
    currentInterval,
    settings,
    startTimer, 
    pauseTimer, 
    skipToNextInterval 
  } = usePomodoro();

  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [workStartSound] = useState(() => new Audio('/work-start.mp3'));
  const [breakStartSound] = useState(() => new Audio('/break-start.mp3'));
  const [lastBreakState, setLastBreakState] = useState(isBreak);

  useEffect(() => {
    const originalTitle = document.title;
    
    const updateTitle = () => {
      if (isRunning) {
        document.title = `(${formatTime(timeRemaining)}) ${isBreak ? 'Break' : 'Focus'} - Pomodoro`;
      } else {
        document.title = originalTitle;
      }
    };

    updateTitle();

    return () => {
      document.title = originalTitle;
    };
  }, [timeRemaining, isRunning, isBreak]);

  useEffect(() => {
    // Play sound when transitioning between work and break states
    if (isBreak !== lastBreakState) {
      if (isBreak) {
        breakStartSound.play().catch(() => {
          // Ignore errors - browser might block autoplay
        });
      } else {
        workStartSound.play().catch(() => {
          // Ignore errors - browser might block autoplay
        });
      }
      setLastBreakState(isBreak);
    }
  }, [isBreak, lastBreakState, breakStartSound, workStartSound]);

  const handleSkip = () => {
    skipToNextInterval();
    setShowSkipDialog(false);
  };

  return (
    <>
      <Header title="Pomodoro timer" />
      
      <div className="flex flex-col items-center justify-center p-12">
        <div className="text-7xl font-mono font-bold mb-6">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: settings.intervalsUntilLongBreak }).map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-5 rounded ${
                index + 1 === currentInterval ? 'bg-[#403085]' : 'bg-gray-700'
              }`}
            ></div>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="p-3 rounded-full bg-[#403085] hover:bg-[#403085]/90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#403085]/25"
            >
              <Play className="h-6 w-6 text-[#9CA3AF]" />
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="p-3 rounded-full bg-[#403085] hover:bg-[#403085]/90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#403085]/25"
            >
              <Pause className="h-6 w-6 text-[#9CA3AF]" />
            </button>
          )}
          
          <button
            onClick={() => setShowSkipDialog(true)}
            className="p-3 rounded-full bg-[#403085] hover:bg-[#403085]/90 transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#403085]/25"
          >
            <SkipForward className="h-6 w-6 text-[#9CA3AF]" />
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <div className={`text-xl font-medium ${isBreak ? 'text-green-400' : 'text-[#403085]'}`}>
            {isBreak 
              ? "Time to take a break! 🌟"
              : "Focus Time"
            }
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {isBreak 
              ? "Rest and recharge for the next session"
              : `Session ${currentInterval} of ${settings.intervalsUntilLongBreak}`
            }
          </div>
        </div>

        <AlertDialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Skip current interval?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to skip the current {isBreak ? 'break' : 'focus'} interval? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSkip}>Skip</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default Pomodoro;
