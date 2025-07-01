import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { validateEmail, validatePassword, RateLimiter, sanitizeInput } from '@/lib/security';
import { useErrorHandler } from '@/lib/errorHandling';
import { useToast } from '@/components/common/Toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const rateLimiter = new RateLimiter(3, 15 * 60 * 1000); // 3 attempts per 15 minutes

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string
  }>({});
  const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; message?: string }>({ valid: false });
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const strength = validatePassword(value);
    setPasswordStrength(strength);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    if (!sanitizedEmail) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(sanitizedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!sanitizedPassword) {
      newErrors.password = 'Password is required';
    } else if (!passwordStrength.valid) {
      newErrors.password = passwordStrength.message;
    }

    if (!sanitizedConfirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (sanitizedPassword !== sanitizedConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Rate limiting check
    const clientId = `signup_${email}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setErrors({ general: `Too many signup attempts. Please try again in ${remainingTime} minutes.` });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedPassword = sanitizeInput(password);

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation
        }
      });

      if (error) {
        handleError(error, { context: 'signup', email: sanitizedEmail });

        if (error.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists. Please sign in instead.' });
        } else if (error.message.includes('Password should be')) {
          setErrors({ password: error.message });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        showSuccessToast('Account created successfully!', 'Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error: unknown) {
      handleError(error, { context: 'signup_catch' });
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
      showErrorToast('Signup failed', 'Please try again or contact support if the problem persists.');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!password) return 'bg-gray-200';
    if (passwordStrength.valid) return 'bg-green-500';
    if (password.length >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthWidth = () => {
    if (!password) return '0%';
    if (passwordStrength.valid) return '100%';
    if (password.length >= 6) return '66%';
    if (password.length >= 3) return '33%';
    return '16%';
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
              Join Labrish
            </motion.h1>
            <motion.p
              className="text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Create your account to start storytelling
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

          <form onSubmit={handleSignup} className="space-y-6" noValidate>
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
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
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
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.password ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                  placeholder="Create a password"
                  required
                  autoComplete="new-password"
                  aria-describedby={errors.password ? 'password-error' : 'password-strength'}
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
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: getPasswordStrengthWidth() }}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {passwordStrength.valid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className={`text-xs ${passwordStrength.valid ? 'text-green-600' : 'text-yellow-600'}`}>
                      {passwordStrength.valid ? 'Strong password' : 'Password requirements not met'}
                    </span>
                  </div>
                </div>
              )}
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password}
                </p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.confirmPassword ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'}`}
                  placeholder="Confirm your password"
                  required
                  autoComplete="new-password"
                  aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword}
                </p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                type="submit"
                disabled={loading || !passwordStrength.valid}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <LoadingSpinner size="sm" text="Creating Account..." />
                ) : (
                  'Create Account'
                )}
              </Button>
            </motion.div>
          </form>
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign in
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;