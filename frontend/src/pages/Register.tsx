import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [nameError, setNameError] = useState('');
  const { register, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      console.log('[Register] User is authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateForm = () => {
    let isValid = true;

    // Validate name
    if (!name) {
      setNameError('Name is required');
      isValid = false;
    } else if (name.length < MIN_NAME_LENGTH) {
      setNameError(`Name must be at least ${MIN_NAME_LENGTH} characters`);
      isValid = false;
    } else if (name.length > MAX_NAME_LENGTH) {
      setNameError(`Name must be less than ${MAX_NAME_LENGTH} characters`);
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      setNameError('Name can only contain letters and spaces');
      isValid = false;
    } else {
      setNameError('');
    }

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      isValid = false;
    } else {
      setPasswordError('');
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await register(email, password, name);
      toast({
        title: "Registration successful",
        description: "Welcome!",
      });
      // Don't navigate here - let useEffect handle it after user is set
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-muted-foreground">Create a new account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) validateForm();
              }}
              className={`w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                nameError ? 'border-red-500' : 'border-input'
              }`}
              placeholder="Enter your name"
              required
              minLength={MIN_NAME_LENGTH}
              maxLength={MAX_NAME_LENGTH}
              disabled={isLoading}
            />
            {nameError && (
              <p className="mt-1 text-sm text-red-500">{nameError}</p>
            )}
          </div>
          
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

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) validateForm();
                }}
                className={`w-full p-3 rounded-md bg-background border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                  confirmPasswordError ? 'border-red-500' : 'border-input'
                }`}
                placeholder="Confirm your password"
                required
                minLength={MIN_PASSWORD_LENGTH}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1 text-sm text-red-500">{confirmPasswordError}</p>
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
                <span>Creating account...</span>
              </>
            ) : (
              'Sign up'
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary hover:underline font-medium transition-colors"
              tabIndex={0}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
