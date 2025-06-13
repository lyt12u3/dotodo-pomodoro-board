import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;

const Login = () => {
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

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Показываем toast, если пришли с message=auth-required
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('message') === 'auth-required') {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите или зарегистрируйтесь для доступа к сервису.',
        variant: 'destructive',
      });
    }
    // eslint-disable-next-line
  }, [location.search]);

  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
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
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
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
      <div className="w-full max-w-md p-8 bg-card rounded-lg shadow border animate-in fade-in slide-in-from-bottom-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-8 w-8 bg-primary rounded mr-2"></div>
            <h1 className="text-2xl font-bold">Do-to-do</h1>
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
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
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
            {emailError && (
              <p className="mt-1 text-sm text-red-500">{emailError}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
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
                placeholder="Enter your password"
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
                <span>Signing in...</span>
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary hover:underline font-medium transition-colors"
              tabIndex={0}
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground">
            Demo: use any email and password to sign in
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
