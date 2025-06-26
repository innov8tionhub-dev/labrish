import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { validateEmail, validatePassword, RateLimiter, sanitizeInput } from '@/lib/security';
import { useErrorHandler } from '@/lib/errorHandling';
import { useToast } from '@/components/common/Toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const rateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const navigate = useNavigate();
  const { handleError, handleInfo } = useErrorHandler();
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!sanitizedEmail) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(sanitizedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!sanitizedPassword) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Rate limiting check
    const clientId = `login_${email}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setErrors({ general: `Too many login attempts. Please try again in ${remainingTime} minutes.` });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        // Handle expected authentication errors as informational logs
        if (error.message.includes('Invalid login credentials')) {
          handleInfo('Login attempt with invalid credentials', { 
            context: 'login_invalid_credentials', 
            email: sanitizedEmail 
          });
          setErrors({ general: 'Invalid email or password. Please check your credentials and try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          handleInfo('Login attempt with unconfirmed email', { 
            context: 'login_unconfirmed_email', 
            email: sanitizedEmail 
          });
          setErrors({ general: 'Please confirm your email address before logging in.' });
        } else if (error.message.includes('Too many requests')) {
          handleInfo('Login rate limit exceeded', { 
            context: 'login_rate_limit', 
            email: sanitizedEmail 
          });
          setErrors({ general: 'Too many login attempts. Please wait a moment before trying again.' });
        } else {
          // Log unexpected authentication errors as critical
          handleError(error, { context: 'login_unexpected_auth_error', email: sanitizedEmail });
          setErrors({ general: 'An authentication error occurred. Please try again or contact support.' });
        }
      } else {
        showSuccessToast('Login successful!', 'Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error: any) {
      // Log unexpected system errors as critical
      handleError(error, { context: 'login_system_error' });
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      showErrorToast('Login failed', 'Please try again or contact support if the problem persists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900/20 via-teal-800/10 to-cyan-900/20 flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-200/50">
          <div className="text-center mb-8">
            <motion.h1 
              className="font-heading text-3xl text-gray-800 mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p 
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Sign in to your Labrish account
            </motion.p>
          </div>

          {errors.general && (
            <motion.div 
              className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{errors.general}</span>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6" noValidate>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                    errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'
                  }`}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Signing In..." />
                ) : (
                  'Sign In'
                )}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;