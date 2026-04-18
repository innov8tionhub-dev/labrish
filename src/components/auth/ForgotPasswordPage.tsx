import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { validateEmail } from '@/lib/security';
import { useErrorHandler } from '@/lib/errorHandling';
import FormField from '@/components/ui/FormField';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { handleError } = useErrorHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: any) {
      handleError(err, { context: 'forgot_password' });
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsSubmitting(false);
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
          <Link
            to="/login"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          {!success ? (
            <>
              <div className="text-center mb-8">
                <h1 className="font-heading text-3xl text-gray-800 mb-2">Reset Your Password</h1>
                <p className="text-gray-600">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {error && (
                <motion.div
                  className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-start gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <FormField
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  leadingIcon={<Mail className="w-5 h-5" />}
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="font-heading text-2xl text-gray-800 mb-4">Check Your Email</h2>

              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Please check your
                inbox and follow the instructions to reset your password.
              </p>

              <p className="text-sm text-gray-500 mb-6">
                Don't see the email? Check your spam folder or try again.
              </p>

              <div className="flex flex-col gap-3">
                <Button onClick={handleSubmit} variant="outline" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resending...
                    </span>
                  ) : (
                    'Resend Email'
                  )}
                </Button>

                <Link to="/login" className="text-sm text-emerald-600 hover:text-emerald-700">
                  Return to Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
