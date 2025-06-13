import { useState, useRef, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../hooks/use-toast';
import { getCurrentUser, updateUserSettings } from '../lib/api';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const MAX_WORK_INTERVAL = 120; // 2 hours
const MAX_SHORT_BREAK = 30; // 30 minutes
const MAX_LONG_BREAK = 60; // 1 hour
const MAX_INTERVALS = 10;

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const { settings: pomodoroSettings, updateSettings: updatePomodoroSettings } = usePomodoro();
  const { settings: userSettings, updateSettings: updateUserSettings, isLoading: isUserSettingsLoading } = useUser();
  const { toast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  console.log('[Settings] Component mounted, user:', user);
  console.log('[Settings] Pomodoro settings:', pomodoroSettings);
  console.log('[Settings] User settings:', userSettings);
  
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [language, setLanguage] = useState(user?.language || 'eng');
  const [workInterval, setWorkInterval] = useState(pomodoroSettings?.workInterval?.toString() || '25');
  const [breakInterval, setBreakInterval] = useState(pomodoroSettings?.breakInterval?.toString() || '5');
  const [intervalsCount, setIntervalsCount] = useState(pomodoroSettings?.intervalsCount?.toString() || '4');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<any>(null);

  // Обновляем состояние при изменении настроек
  useEffect(() => {
    if (pomodoroSettings) {
      setWorkInterval(pomodoroSettings.workInterval.toString());
      setBreakInterval(pomodoroSettings.breakInterval.toString());
      setIntervalsCount(pomodoroSettings.intervalsCount.toString());
    }
  }, [pomodoroSettings]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setLanguage(user.language || 'eng');
    }
  }, [user]);

  if (isUserSettingsLoading) {
    return (
      <>
        <Header title={t('settings.title')} />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }
  
  const validateSettings = () => {
    const workMinutes = parseInt(workInterval);
    const breakMinutes = parseInt(breakInterval);
    const intervals = parseInt(intervalsCount);
    
    if (name) {
      if (name.length > 50) {
        toast({
          title: t('settings.validation.invalidName'),
          description: t('settings.validation.nameTooLong'),
          variant: "destructive",
        });
        return false;
      }
      
      if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(name)) {
        toast({
          title: t('settings.validation.invalidName'),
          description: t('settings.validation.nameInvalidChars'),
          variant: "destructive",
        });
        return false;
      }
    }
    
    if (isNaN(workMinutes) || workMinutes <= 0 || workMinutes > MAX_WORK_INTERVAL) {
      toast({
        title: t('settings.validation.invalidWorkInterval'),
        description: t('settings.validation.workIntervalRange', { max: MAX_WORK_INTERVAL }),
        variant: "destructive",
      });
      return false;
    }
    
    if (isNaN(breakMinutes) || breakMinutes <= 0 || breakMinutes > MAX_SHORT_BREAK) {
      toast({
        title: t('settings.validation.invalidBreakInterval'),
        description: t('settings.validation.breakIntervalRange', { max: MAX_SHORT_BREAK }),
        variant: "destructive",
      });
      return false;
    }
    
    if (isNaN(intervals) || intervals <= 0 || intervals > MAX_INTERVALS) {
      toast({
        title: t('settings.validation.invalidIntervals'),
        description: t('settings.validation.intervalsRange', { max: MAX_INTERVALS }),
        variant: "destructive",
      });
      return false;
    }
    
    return {
      name,
      language,
      workInterval: workMinutes,
      breakInterval: breakMinutes,
      intervalsCount: intervals
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
      // Update user settings (name and language)
      if (pendingSettings.name !== undefined || pendingSettings.language !== undefined) {
        try {
          const userSettingsUpdate = {
            name: pendingSettings.name,
            language: pendingSettings.language
          };
          
          await updateUserSettings(userSettingsUpdate);
          
          // Refresh user data to update the name in the header
          const userData = await getCurrentUser();
          setUser(userData);
          
          // Update i18n language if changed
          if (pendingSettings.language !== i18n.language) {
            i18n.changeLanguage(pendingSettings.language);
          }
        } catch (error: any) {
          if (error.message?.includes('can only contain letters')) {
            toast({
              title: t('settings.validation.invalidNameFormat'),
              description: (
                <div className="flex items-start space-x-2">
                  <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{t('settings.validation.nameContainsInvalid')}</p>
                    <p className="text-sm text-muted-foreground">
                      {t('settings.validation.nameAllowedChars')}
                    </p>
                    <p className="text-sm font-medium text-destructive">
                      {t('settings.validation.nameExample')}
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
          throw error;
        }
      }

      // Update pomodoro settings
      if (
        pendingSettings.workInterval !== undefined ||
        pendingSettings.breakInterval !== undefined ||
        pendingSettings.intervalsCount !== undefined
      ) {
        const pomodoroSettingsUpdate = {
          workInterval: parseInt(pendingSettings.workInterval),
          breakInterval: parseInt(pendingSettings.breakInterval),
          intervalsCount: parseInt(pendingSettings.intervalsCount)
        };

        await updatePomodoroSettings(pomodoroSettingsUpdate);
      }

      toast({
        title: t('settings.saveSuccess'),
        description: t('settings.saveSuccessDesc'),
      });
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast({
        title: t('settings.saveFailed'),
        description: error instanceof Error ? error.message : t('settings.saveError'),
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
    }
  };

  return (
    <>
      <Header title={t('settings.title')} />
      <div className="container mx-0 ml-4 max-w-xl p-4 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                {t('settings.name')}
              </label>
              <input
                ref={nameInputRef}
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder={t('settings.namePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-2">
                {t('settings.language')}
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eng">{t('languages.eng')}</SelectItem>
                  <SelectItem value="ua">{t('languages.ua')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="workInterval" className="block text-sm font-medium mb-2">
                {t('settings.workInterval')}
              </label>
              <input
                id="workInterval"
                type="number"
                value={workInterval}
                onChange={(e) => setWorkInterval(e.target.value)}
                className="w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                min="1"
                max={MAX_WORK_INTERVAL}
              />
            </div>

            <div>
              <label htmlFor="breakInterval" className="block text-sm font-medium mb-2">
                {t('settings.breakInterval')}
              </label>
              <input
                id="breakInterval"
                type="number"
                value={breakInterval}
                onChange={(e) => setBreakInterval(e.target.value)}
                className="w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                min="1"
                max={MAX_SHORT_BREAK}
              />
            </div>

            <div>
              <label htmlFor="intervalsCount" className="block text-sm font-medium mb-2">
                {t('settings.intervalsCount')}
              </label>
              <input
                id="intervalsCount"
                type="number"
                value={intervalsCount}
                onChange={(e) => setIntervalsCount(e.target.value)}
                className="w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                min="1"
                max={MAX_INTERVALS}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full p-3 bg-[#7857FF] hover:bg-[#7857FF]/90 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('settings.saving')}</span>
              </>
            ) : (
              t('settings.save')
            )}
          </button>
        </form>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.confirmTitle')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('settings.confirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('settings.cancel')}</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmSave} 
                disabled={isSubmitting}
                className="bg-[#7857FF] hover:bg-[#7857FF]/90"
              >
                {isSubmitting ? t('settings.saving') : t('settings.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default Settings;
