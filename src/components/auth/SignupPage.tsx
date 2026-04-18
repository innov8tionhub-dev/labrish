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
import FormField from '@/components/ui/FormField';
import { useFormState } from '@/hooks/useFormState';

const rateLimiter = new RateLimiter(3, 15 * 60 * 1000);

interface SignupForm extends Record<string, unknown> {
  email: string;
  password: string;
  confirmPassword: string;
}

const PasswordToggle: React.FC<{
  visible: boolean;
  onToggle: () => void;
}> = ({ visible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="text-gray-400 hover:text-gray-600"
    aria-label={visible ? 'Hide password' : 'Show password'}
  >
    {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
  </button>
);

const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ valid: boolean; message?: string }>({
    valid: false,
  });

  const { values, errors, setValue, setErrors, setFieldError } = useFormState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const handlePasswordChange = (value: string) => {
    setValue('password', value);
    setPasswordStrength(validatePassword(value));
  };

  const validateForm = (): boolean => {
    const sanitizedEmail = sanitizeInput(values.email);
    const sanitizedPassword = sanitizeInput(values.password);
    const sanitizedConfirm = sanitizeInput(values.confirmPassword);
    const nextErrors: typeof errors = {};

    if (!sanitizedEmail) nextErrors.email = 'Email is required';
    else if (!validateEmail(sanitizedEmail))
      nextErrors.email = 'Please enter a valid email address';

    if (!sanitizedPassword) nextErrors.password = 'Password is required';
    else if (!passwordStrength.valid) nextErrors.password = passwordStrength.message;

    if (!sanitizedConfirm) nextErrors.confirmPassword = 'Please confirm your password';
    else if (sanitizedPassword !== sanitizedConfirm)
      nextErrors.confirmPassword = 'Passwords do not match';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const clientId = `signup_${values.email}`;
    if (!rateLimiter.isAllowed(clientId)) {
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60);
      setFieldError(
        'general',
        `Too many signup attempts. Please try again in ${remainingTime} minutes.`
      );
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const sanitizedEmail = sanitizeInput(values.email);
      const sanitizedPassword = sanitizeInput(values.password);

      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: sanitizedPassword,
        options: { emailRedirectTo: undefined },
      });

      if (error) {
        handleError(error, { context: 'signup', email: sanitizedEmail });

        if (error.message.includes('already registered')) {
          setFieldError(
            'email',
            'An account with this email already exists. Please sign in instead.'
          );
        } else if (error.message.includes('Password should be')) {
          setFieldError('password', error.message);
        } else {
          setFieldError('general', error.message);
        }
      } else {
        showSuccessToast('Account created successfully!', 'Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: unknown) {
      handleError(err, { context: 'signup_catch' });
      setFieldError('general', 'An unexpected error occurred. Please try again.');
      showErrorToast(
        'Signup failed',
        'Please try again or contact support if the problem persists.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!values.password) return 'bg-gray-200';
    if (passwordStrength.valid) return 'bg-green-500';
    if (values.password.length >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPasswordStrengthWidth = () => {
    if (!values.password) return '0%';
    if (passwordStrength.valid) return '100%';
    if (values.password.length >= 6) return '66%';
    if (values.password.length >= 3) return '33%';
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
            <h1 className="font-heading text-3xl text-gray-800 mb-2">Join Labrish</h1>
            <p className="text-gray-600">Create your account to start storytelling</p>
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

            <div>
              <FormField
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                label="Password"
                value={values.password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                leadingIcon={<Lock className="w-5 h-5" />}
                placeholder="Create a password"
                autoComplete="new-password"
                required
                error={errors.password}
                trailingIcon={
                  <PasswordToggle
                    visible={showPassword}
                    onToggle={() => setShowPassword((v) => !v)}
                  />
                }
              />
              {values.password && (
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
                    <span
                      className={`text-xs ${passwordStrength.valid ? 'text-green-600' : 'text-yellow-600'}`}
                    >
                      {passwordStrength.valid
                        ? 'Strong password'
                        : 'Password requirements not met'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <FormField
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              value={values.confirmPassword}
              onChange={(e) => setValue('confirmPassword', e.target.value)}
              leadingIcon={<Lock className="w-5 h-5" />}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword}
              trailingIcon={
                <PasswordToggle
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword((v) => !v)}
                />
              }
            />

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
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
