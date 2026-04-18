import { useCallback, useRef, useState } from 'react';

type AsyncFn<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

export interface UseAsyncOperationResult<TArgs extends unknown[], TResult> {
  isLoading: boolean;
  error: string | null;
  data: TResult | null;
  execute: (...args: TArgs) => Promise<TResult | null>;
  reset: () => void;
}

export function useAsyncOperation<TArgs extends unknown[], TResult>(
  fn: AsyncFn<TArgs, TResult>
): UseAsyncOperationResult<TArgs, TResult> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TResult | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const execute = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { isLoading, error, data, execute, reset };
}
