import { useState, useRef } from 'react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useToast } from '../hooks/use-toast';
import { getCurrentUser, updateUserSettings } from '../lib/api';
import { XCircle } from 'lucide-react';
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

const MAX_WORK_INTERVAL = 120; // 2 hours
const MAX_SHORT_BREAK = 30; // 30 minutes
const MAX_LONG_BREAK = 60; // 1 hour
const MAX_INTERVALS = 10;

const Settings = () => {
  const { user, setUser } = useAuth();
  const { settings, updateSettings } = usePomodoro();
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [workInterval, setWorkInterval] = useState(settings.workInterval.toString());
  const [shortBreakInterval, setShortBreakInterval] = useState(settings.shortBreakInterval.toString());
  const [longBreakInterval, setLongBreakInterval] = useState(settings.longBreakInterval.toString());
  const [intervalsUntilLongBreak, setIntervalsUntilLongBreak] = useState(settings.intervalsUntilLongBreak.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<any>(null);
  
  const validateSettings = () => {
    const workMinutes = parseInt(workInterval);
    const shortBreakMinutes = parseInt(shortBreakInterval);
    const longBreakMinutes = parseInt(longBreakInterval);
    const intervals = parseInt(intervalsUntilLongBreak);
    
    if (name) {
      if (name.length > 50) {
        toast({
          title: "Invalid name",
          description: "Name must be less than 50 characters",
          variant: "destructive",
        });
        return false;
      }
      
      if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name)) {
        toast({
          title: "Invalid name",
          description: "Name can only contain letters, spaces and hyphens",
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (isNaN(workMinutes) || workMinutes <= 0 || workMinutes > MAX_WORK_INTERVAL) {
      toast({
        title: "Invalid work interval",
        description: `Work interval must be between 1 and ${MAX_WORK_INTERVAL} minutes`,
        variant: "destructive",
      });
      return false;
    }
    
    if (isNaN(shortBreakMinutes) || shortBreakMinutes <= 0 || shortBreakMinutes > MAX_SHORT_BREAK) {
      toast({
        title: "Invalid short break interval",
        description: `Short break interval must be between 1 and ${MAX_SHORT_BREAK} minutes`,
        variant: "destructive",
      });
      return false;
    }
    
    if (isNaN(longBreakMinutes) || longBreakMinutes <= 0 || longBreakMinutes > MAX_LONG_BREAK) {
      toast({
        title: "Invalid long break interval",
        description: `Long break interval must be between 1 and ${MAX_LONG_BREAK} minutes`,
        variant: "destructive",
      });
      return false;
    }
    
    if (isNaN(intervals) || intervals <= 0 || intervals > MAX_INTERVALS) {
      toast({
        title: "Invalid intervals count",
        description: `Intervals count must be between 1 and ${MAX_INTERVALS}`,
        variant: "destructive",
      });
      return false;
    }
    
    return {
      name,
      workInterval: workMinutes,
      shortBreakInterval: shortBreakMinutes,
      longBreakInterval: longBreakMinutes,
      intervalsUntilLongBreak: intervals
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validSettings = validateSettings();
    if (!validSettings) return;
    
    setPendingSettings(validSettings);
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingSettings) return;
    
    setIsSubmitting(true);
    try {
      // Update user settings (name)
      if (pendingSettings.name !== undefined) {
        try {
          await updateUserSettings({ name: pendingSettings.name });
          // Refresh user data to update the name in the header
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error: any) {
          if (error.message?.includes('can only contain letters')) {
            toast({
              title: "Invalid Name Format",
              description: (
                <div className="flex items-start space-x-2">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>Your name contains invalid characters.</p>
                    <p className="text-sm text-muted-foreground">
                      Please use only letters, spaces, and hyphens.
                    </p>
                    <p className="text-sm font-medium text-destructive">
                      Example: "John Doe" or "Anna-Maria"
                    </p>
                  </div>
                </div>
              ),
              variant: "destructive",
              duration: 5000,
            });
            setIsSubmitting(false);
            setShowConfirmDialog(false);
            return;
          }
        }
      }

      // Update pomodoro settings
      const pomodoroSettings = {
        workInterval: pendingSettings.workInterval,
        shortBreakInterval: pendingSettings.shortBreakInterval,
        longBreakInterval: pendingSettings.longBreakInterval,
        intervalsUntilLongBreak: pendingSettings.intervalsUntilLongBreak
      };
      await updateSettings(pomodoroSettings);

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
      setShowConfirmDialog(false);
    } catch (error) {
      toast({
        title: "Failed to save settings",
        description: error instanceof Error ? error.message : "An error occurred while saving settings",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (value: string) => {
    if (!value || /^[a-zA-Zа-яА-ЯёЁ\s-]*$/.test(value)) {
      setName(value);
    } else {
      // Add shake animation class
      if (nameInputRef.current) {
        nameInputRef.current.classList.add('animate-shake');
        // Remove the class after animation completes
        setTimeout(() => {
          if (nameInputRef.current) {
            nameInputRef.current.classList.remove('animate-shake');
          }
        }, 500);
      }
      
      // Show a small toast notification
      toast({
        title: "Invalid character",
        description: "Only letters, spaces and hyphens are allowed",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <>
      <Header title="Settings" />
      
      <div className="p-6">
        <form onSubmit={handleSubmit} className="max-w-md animate-in fade-in slide-in-from-left-5">
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            />
          </div>

          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name:
            </label>
            <input
              ref={nameInputRef}
              id="name"
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Enter your name (letters only)"
              maxLength={50}
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-400">Only letters, spaces and hyphens are allowed</p>
          </div>
          
          <div className="border-t border-gray-700 pt-6 mb-4">
            <h2 className="text-lg font-semibold mb-4">Pomodoro Settings</h2>
            
            <div className="mb-4">
              <label htmlFor="workInterval" className="block text-sm font-medium mb-1">
                Work interval (min.):
              </label>
              <input
                id="workInterval"
                type="number"
                value={workInterval}
                onChange={(e) => setWorkInterval(e.target.value)}
                className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max={MAX_WORK_INTERVAL}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">Maximum {MAX_WORK_INTERVAL} minutes (2 hours)</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="shortBreakInterval" className="block text-sm font-medium mb-1">
                Short break interval (min.):
              </label>
              <input
                id="shortBreakInterval"
                type="number"
                value={shortBreakInterval}
                onChange={(e) => setShortBreakInterval(e.target.value)}
                className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max={MAX_SHORT_BREAK}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">Maximum {MAX_SHORT_BREAK} minutes</p>
            </div>
            
            <div className="mb-4">
              <label htmlFor="longBreakInterval" className="block text-sm font-medium mb-1">
                Long break interval (min.):
              </label>
              <input
                id="longBreakInterval"
                type="number"
                value={longBreakInterval}
                onChange={(e) => setLongBreakInterval(e.target.value)}
                className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max={MAX_LONG_BREAK}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">Maximum {MAX_LONG_BREAK} minutes (1 hour)</p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="intervals" className="block text-sm font-medium mb-1">
                Intervals until long break:
              </label>
              <input
                id="intervals"
                type="number"
                value={intervalsUntilLongBreak}
                onChange={(e) => setIntervalsUntilLongBreak(e.target.value)}
                className="w-full p-2 rounded bg-secondary text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                max={MAX_INTERVALS}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-400">Maximum {MAX_INTERVALS} intervals</p>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#403085] hover:bg-[#403085]/90 text-[#9CA3AF] rounded transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-[#403085]/25 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#9CA3AF] border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              'Save'
            )}
          </button>
        </form>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save settings?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these settings? This will affect your current Pomodoro session if one is active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSave}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/80"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Settings;
