import React from 'react';
import { AlertCircle } from 'lucide-react';

interface AsyncContainerProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyState?: React.ReactNode;
  loadingState?: React.ReactNode;
  errorState?: React.ReactNode;
  children: React.ReactNode;
}

const DefaultLoading: React.FC = () => (
  <div
    className="flex items-center justify-center py-16"
    role="status"
    aria-live="polite"
    aria-label="Loading content"
  >
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
  </div>
);

const DefaultError: React.FC<{ message: string }> = ({ message }) => (
  <div
    className="flex flex-col items-center justify-center py-16 text-center"
    role="alert"
  >
    <AlertCircle className="w-10 h-10 text-red-500 mb-3" aria-hidden="true" />
    <p className="text-gray-700 max-w-md">{message}</p>
  </div>
);

/**
 * Standardized async container that handles loading, error, and empty
 * states so pages can focus on rendering their happy path.
 */
export const AsyncContainer: React.FC<AsyncContainerProps> = ({
  loading,
  error,
  empty,
  emptyState,
  loadingState,
  errorState,
  children,
}) => {
  if (loading) return <>{loadingState ?? <DefaultLoading />}</>;
  if (error) return <>{errorState ?? <DefaultError message={error} />}</>;
  if (empty && emptyState) return <>{emptyState}</>;
  return <>{children}</>;
};

export default AsyncContainer;
