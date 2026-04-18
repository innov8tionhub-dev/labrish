/**
 * Centralized error handling and logging.
 *
 * Errors are captured in-memory and, when a user is authenticated, also
 * persisted to Supabase (`user_error_logs`) so they can be reviewed by the
 * owning user or aggregated by admins later.
 */

import { supabase } from './supabase';

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  userId?: string;
}

class ErrorHandler {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;

  logError(
    error: Error | string,
    context?: Record<string, unknown>,
    level: 'error' | 'warning' | 'info' = 'error',
  ): void {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
    };

    this.errors.unshift(errorLog);

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }

    void this.sendToErrorService(errorLog);
  }

  private async sendToErrorService(errorLog: ErrorLog): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('user_error_logs').insert({
        user_id: user.id,
        level: errorLog.level,
        message: errorLog.message.slice(0, 2000),
        stack: errorLog.stack?.slice(0, 10000) ?? null,
        context: errorLog.context ?? {},
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        page_url: typeof window !== 'undefined' ? window.location.href : null,
      });
    } catch {
      // Swallow: we must never let the error sink itself throw.
    }
  }

  getErrors(): ErrorLog[] {
    return [...this.errors];
  }

  clearErrors(): void {
    this.errors = [];
  }

  getErrorsByLevel(level: 'error' | 'warning' | 'info'): ErrorLog[] {
    return this.errors.filter(error => error.level === level);
  }
}

export const errorHandler = new ErrorHandler();

export const useErrorHandler = () => {
  const handleError = (error: Error | string, context?: Record<string, unknown>) => {
    errorHandler.logError(error, context);
  };

  const handleWarning = (message: string, context?: Record<string, unknown>) => {
    errorHandler.logError(message, context, 'warning');
  };

  const handleInfo = (message: string, context?: Record<string, unknown>) => {
    errorHandler.logError(message, context, 'info');
  };

  return { handleError, handleWarning, handleInfo };
};

export const withErrorHandling = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: Record<string, unknown>,
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorHandler.logError(error as Error, { ...context, args });
      throw error;
    }
  }) as T;
};

export const handleNetworkError = (error: unknown): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }

  const err = error as Record<string, unknown>;

  if (err?.name === 'AbortError') {
    return 'Request was cancelled. Please try again.';
  }

  if (err?.code === 'NETWORK_ERROR') {
    return 'Network error occurred. Please check your connection.';
  }

  const status = typeof err?.status === 'number' ? err.status : 0;

  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }

  if (status >= 500) {
    return 'Server error occurred. Please try again later.';
  }

  if (status === 404) {
    return 'Requested resource not found.';
  }

  if (status === 403) {
    return 'Access denied. Please check your permissions.';
  }

  if (status === 401) {
    return 'Authentication required. Please log in again.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
