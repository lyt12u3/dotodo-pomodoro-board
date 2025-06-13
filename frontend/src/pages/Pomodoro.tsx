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
  const [notificationSound] = useState(() => new Audio('/notification.mp3'));

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
    if (timeRemaining === 0) {
      notificationSound.play().catch(() => {
        // Ignore errors - browser might block autoplay
      });
    }
  }, [timeRemaining, notificationSound]);

  const handleSkip = () => {
    skipToNextInterval();
    setShowSkipDialog(false);
  };

  return (
    <>
      <Header title="Pomodoro timer" />
      
      <div className="flex flex-col items-center justify-center p-12">
        <div className="text-7xl font-mono font-bold mb-6 transition-all animate-in fade-in zoom-in">
          {formatTime(timeRemaining)}
        </div>
        
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: settings.intervalsUntilLongBreak }).map((_, index) => (
            <div 
              key={index}
              className={`h-1 w-5 rounded transition-colors ${
                index + 1 === currentInterval ? 'bg-primary' : 'bg-gray-700'
              }`}
            ></div>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="p-3 rounded-full bg-primary hover:bg-primary/80 text-white transition-colors"
            >
              <Play className="h-6 w-6" />
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="p-3 rounded-full bg-primary hover:bg-primary/80 text-white transition-colors"
            >
              <Pause className="h-6 w-6" />
            </button>
          )}
          
          <button
            onClick={() => setShowSkipDialog(true)}
            className="p-3 rounded-full bg-secondary hover:bg-secondary/80 text-white transition-colors"
          >
            <SkipForward className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mt-8 text-xl font-medium transition-all animate-in fade-in slide-in-from-bottom-2">
          {isBreak 
            ? (currentInterval >= settings.intervalsUntilLongBreak 
              ? 'Long Break' 
              : 'Short Break')
            : 'Focus Time'
          }
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
