import { usePomodoro } from "@/contexts/PomodoroContext";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

const PomodoroTimer = () => {
  const {
    timeRemaining,
    isActive,
    isPaused,
    startTimer,
    pauseTimer,
    resetTimer,
    currentInterval,
    isWorkInterval
  } = usePomodoro();

  // Format time remaining into minutes and seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress for the progress indicator dots
  const renderProgressDots = () => {
    const dots = [];
    const totalIntervals = 8; // Display 8 dots
    
    for (let i = 1; i <= totalIntervals; i++) {
      // Current interval is highlighted
      const isCurrentDot = i === currentInterval * 2 - (isWorkInterval ? 1 : 0);
      // Past intervals are filled
      const isPastDot = (i < currentInterval * 2 - (isWorkInterval ? 1 : 0)) || (i === 1 && isActive);
      
      dots.push(
        <div
          key={i}
          className={`w-4 h-4 rounded-full ${
            isCurrentDot
              ? 'bg-purple-500'
              : isPastDot
              ? 'bg-white'
              : 'border border-gray-600'
          }`}
        />
      );
    }
    
    return dots;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-8xl font-bold mb-6">{formatTime(timeRemaining)}</div>
      
      <div className="flex space-x-3 mb-6">
        {renderProgressDots()}
      </div>
      
      <div className="flex gap-4">
        {!isActive || isPaused ? (
          <Button 
            onClick={startTimer}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full border-gray-600"
          >
            <Play fill="currentColor" />
          </Button>
        ) : (
          <Button 
            onClick={pauseTimer}
            size="icon"
            variant="outline"
            className="h-12 w-12 rounded-full border-gray-600"
          >
            <Pause fill="currentColor" />
          </Button>
        )}
        
        <Button
          onClick={resetTimer}
          size="icon"
          variant="outline"
          className="h-12 w-12 rounded-full border-gray-600"
        >
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
};

export default PomodoroTimer; 