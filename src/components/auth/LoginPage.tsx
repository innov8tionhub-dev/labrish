import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { validateEmail, sanitizeInput, RateLimiter } from '@/lib/security';
import { useErrorHandler } from '@/lib/errorHandling';
import { useToast } from '@/components/common/Toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import FormField from '@/components/ui/FormField';
import { useFormState } from '@/hooks/useFormState';

const rateLimiter = new RateLimiter(5, 15 * 60 * 1000);

interface LoginForm extends Record<string, unknown> {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { values, errors, setValue, setErrors, setFieldError } = useFormState<LoginForm>({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { handleError, handleInfo } = useErrorHandler();
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const validateForm = (): boolean => {
    const sanitizedEmail = sanitizeInput(values.email);
    const sanitizedPassword = sanitizeInput(values.password);
    const nextErrors: typeof errors = {};

    if (!sanitizedEmail) {
      nextErrors.email = 'Email is required';
    } else if (!validateEmail(sanitizedEmail)) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!sanitizedPassword) {
      nextErrors.password = 'Password is required';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const clientId = `login_${values.email}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setFieldError(
        'general',
        `Too many login attempts. Please try again in ${remainingTime} minutes.`
      );
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sanitizedEmail = sanitizeInput(values.email);
      const sanitizedPassword = sanitizeInput(values.password);

      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: sanitizedPassword,
      });

      if (error) {
        const context = { email: sanitizedEmail };
        if (error.message.includes('Invalid login credentials')) {
          handleInfo('Login attempt with invalid credentials', {
            ...context,
            context: 'login_invalid_credentials',
          });
          setFieldError(
            'general',
            'Invalid email or password. Please check your credentials and try again.'
          );
        } else if (error.message.includes('Email not confirmed')) {
          handleInfo('Login attempt with unconfirmed email', {
            ...context,
            context: 'login_unconfirmed_email',
          });
          setFieldError('general', 'Please confirm your email address before logging in.');
        } else if (error.message.includes('Too many requests')) {
          handleInfo('Login rate limit exceeded', {
            ...context,
            context: 'login_rate_limit',
          });
          setFieldError(
            'general',
            'Too many login attempts. Please wait a moment before trying again.'
          );
        } else {
          handleError(error, { context: 'login_unexpected_auth_error', ...context });
          setFieldError(
            'general',
            'An authentication error occurred. Please try again or contact support.'
          );
        }
      } else {
        showSuccessToast('Login successful!', 'Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: unknown) {
      handleError(err, { context: 'login_system_error' });
      setFieldError('general', 'An unexpected error occurred. Please try again.');
      showErrorToast(
        'Login failed',
        'Please try again or contact support if the problem persists.'
      );
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
            <h1 className="font-heading text-3xl text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Labrish account</p>
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
            <FormField
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={values.email}
              onChange={(e) => setValue('email', e.target.value)}
              leadingIcon={<Mail className="w-5 h-5" />}
              placeholder="Enter your email"
              autoComplete="email"
              required
              error={errors.email}
            />

            <FormField
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              value={values.password}
              onChange={(e) => setValue('password', e.target.value)}
              leadingIcon={<Lock className="w-5 h-5" />}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              error={errors.password}
              trailingIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" text="Signing In..." /> : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-3">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign up
              </Link>
            </p>
            <p className="text-gray-600">
              <Link to="/forgot-password" className="text-emerald-600 hover:text-emerald-700">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
