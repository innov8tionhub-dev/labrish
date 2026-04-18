import { useCallback, useEffect, useState } from 'react';
import { errorHandler } from '@/lib/errorHandling';

type QueryResult<T> = { data: T | null; error: { message: string } | null };

/**
 * Thin wrapper around ad-hoc Supabase queries that standardizes the
 * loading / error / data lifecycle used across DiscoverPage, LearnPage,
 * QuizPage, and StoryLibrary.
 *
 * Pass a function that returns a Supabase `{ data, error }` shape.
 * The hook manages state transitions and routes errors through
 * the centralized error handler.
 */
export function useSupabaseQuery<T>(
  fetcher: () => Promise<QueryResult<T>>,
  deps: ReadonlyArray<unknown> = [],
  options: { enabled?: boolean; context?: Record<string, unknown> } = {},
) {
  const { enabled = true, context } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      if (result.error) throw new Error(result.error.message);
      setData(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Query failed';
      setError(message);
      errorHandler.logError(err as Error, context);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, run]);

  return { data, error, loading, refetch: run };
}
