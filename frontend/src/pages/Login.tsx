import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../components/LanguageSelector';
import logo from '../assets/logo.svg';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState(() => localStorage.getItem('lastEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const hasShownToast = useRef(false);

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log('[Login] User is authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Показываем toast, если пришли с message=auth-required (только один раз)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('message') === 'auth-required' && !hasShownToast.current) {
      hasShownToast.current = true;
      toast({
        title: t('auth.login.authRequired'),
        description: t('auth.login.authRequiredDesc'),
        variant: 'destructive',
      });
      // Очищаем URL от параметра после показа toast
      navigate('/login', { replace: true });
    }
  }, [location.search, toast, navigate, t]);

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError(t('auth.login.emailRequired'));
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError(t('auth.login.emailInvalid'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError(t('auth.login.passwordRequired'));
      isValid = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('auth.login.passwordLength', { length: MIN_PASSWORD_LENGTH }));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await login(email, password);
      localStorage.setItem('lastEmail', email);
      toast({
        title: t('auth.login.success'),
        description: t('auth.login.welcomeBack'),
      });
      // Don't navigate here - let useEffect handle it after user is set
    } catch (error) {
      toast({
        title: t('auth.login.failed'),
        description: error instanceof Error ? error.message : t('auth.login.invalidCredentials'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow border animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="Do-to-do Logo" className="h-8 w-8 mr-2" />
            <h1 className="text-2xl font-bold">Do-to-do</h1>
          </div>
          <p className="text-muted-foreground">{t('auth.login.title')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('auth.login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateForm();
              }}
              className={`w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                emailError ? 'border-red-500' : 'border-input'
              }`}
              placeholder={t('auth.login.emailPlaceholder')}
              required
              disabled={isLoading}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              {t('auth.login.password')}
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validateForm();
                }}
                className={`w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  passwordError ? 'border-red-500' : 'border-input'
                }`}
                placeholder={t('auth.login.passwordPlaceholder')}
                required
                minLength={MIN_PASSWORD_LENGTH}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1 text-sm text-red-500">{passwordError}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>{t('auth.login.signingIn')}</span>
              </>
            ) : (
              t('auth.login.submit')
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.login.noAccount')}{' '}
            <Link 
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              {t('auth.login.signUp')}
            </Link>
          </p>
        </div>

        
      </div>
    </div>
  );
};

export default Login;
