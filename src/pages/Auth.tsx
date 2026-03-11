import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight, Eye, EyeOff } from 'lucide-react';
import appIcon from '@/assets/app-icon.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');


export default function Auth() {
  const navigate = useNavigate();
  const { user, signInWithEmail, signUpWithEmail } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{ email?: string; password?: string; phone?: string }>({});

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = () => {
    try {
      emailSchema.parse(email);
      setErrors(prev => ({ ...prev, email: undefined }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, email: e.errors[0].message }));
      }
      return false;
    }
  };

  const validatePassword = () => {
    try {
      passwordSchema.parse(password);
      setErrors(prev => ({ ...prev, password: undefined }));
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, password: e.errors[0].message }));
      }
      return false;
    }
  };

  const handleEmailAuth = async () => {
    if (!validateEmail() || !validatePassword()) return;

    setIsLoading(true);
    try {
      const { error } = authMode === 'login'
        ? await signInWithEmail(email, password)
        : await signUpWithEmail(email, password);

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('User already registered')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        }
        toast({
          variant: 'destructive',
          title: t('error'),
          description: errorMessage,
        });
      } else if (authMode === 'signup') {
        toast({
          title: t('success'),
          description: 'Please check your email to verify your account.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Language Selector */}
      <div className="p-4 flex justify-end">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm font-medium"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName}
            </option>
          ))}
        </select>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="text-center mb-8 animate-fade-in">
          <img src={appIcon} alt="Smart Crop Advisory System" className="w-20 h-20 object-contain rounded-2xl mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('appName')}</h1>
          <p className="text-muted-foreground text-lg">
            Smart Farming Advisory System
          </p>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-md animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {authMode === 'login' ? t('login') : t('signup')}
            </CardTitle>
            <CardDescription>
              {authMode === 'login'
                ? 'Welcome back! Sign in to continue.'
                : 'Create an account to get started.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={t('email')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={validateEmail}
                    className="h-12 text-base"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('password')}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={validatePassword}
                      className="h-12 text-base pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-destructive text-sm">{errors.password}</p>
                  )}
                </div>
                <Button
                  onClick={handleEmailAuth}
                  disabled={isLoading}
                  className="w-full h-12 text-base gap-2"
                >
                  {isLoading ? t('loading') : authMode === 'login' ? t('login') : t('signup')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
            </div>

            {/* Toggle Auth Mode */}
            <div className="text-center pt-2">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-sm text-primary hover:underline"
              >
                {authMode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Login'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
