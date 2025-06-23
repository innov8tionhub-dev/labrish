/**
 * Centralized error handling and logging
 */

export interface ErrorLog {
  id: string;
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
}

class ErrorHandler {
  private errors: ErrorLog[] = [];
  private maxErrors = 100;

  logError(error: Error | string, context?: Record<string, any>, level: 'error' | 'warning' | 'info' = 'error'): void {
    const errorLog: ErrorLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'object' ? error.stack : undefined,
      context,
    };

    this.errors.unshift(errorLog);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error logged:', errorLog);
    }

    // In production, you would send this to your error tracking service
    this.sendToErrorService(errorLog);
  }

  private async sendToErrorService(errorLog: ErrorLog): Promise<void> {
    // Placeholder for error tracking service integration
    // In production, integrate with services like Sentry, LogRocket, etc.
    try {
      // Example: await fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorLog) });
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
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

// Error boundary hook
export const useErrorHandler = () => {
  const handleError = (error: Error | string, context?: Record<string, any>) => {
    errorHandler.logError(error, context);
  };

  const handleWarning = (message: string, context?: Record<string, any>) => {
    errorHandler.logError(message, context, 'warning');
  };

  const handleInfo = (message: string, context?: Record<string, any>) => {
    errorHandler.logError(message, context, 'info');
  };

  return { handleError, handleWarning, handleInfo };
};

// Async error wrapper
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: Record<string, any>
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

// Network error handler
export const handleNetworkError = (error: any): string => {
  if (!navigator.onLine) {
    return 'No internet connection. Please check your network and try again.';
  }
  
  if (error.name === 'AbortError') {
    return 'Request was cancelled. Please try again.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error occurred. Please check your connection.';
  }
  
  if (error.status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error.status >= 500) {
    return 'Server error occurred. Please try again later.';
  }
  
  if (error.status === 404) {
    return 'Requested resource not found.';
  }
  
  if (error.status === 403) {
    return 'Access denied. Please check your permissions.';
  }
  
  if (error.status === 401) {
    return 'Authentication required. Please log in again.';
  }
  
  return error.message || 'An unexpected error occurred. Please try again.';
};