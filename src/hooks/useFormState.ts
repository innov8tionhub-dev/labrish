import { useCallback, useState } from 'react';

export type FormErrors<T> = Partial<Record<keyof T | 'general', string>>;

export interface UseFormStateResult<T extends Record<string, unknown>> {
  values: T;
  errors: FormErrors<T>;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors<T>) => void;
  setFieldError: (field: keyof T | 'general', message?: string) => void;
  clearErrors: () => void;
  reset: () => void;
}

export function useFormState<T extends Record<string, unknown>>(
  initial: T
): UseFormStateResult<T> {
  const [values, setAllValues] = useState<T>(initial);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setAllValues((prev) => ({ ...prev, [field]: value }));
    setErrorsState((prev) => {
      if (!prev[field] && !prev.general) return prev;
      const next = { ...prev };
      delete next[field];
      delete next.general;
      return next;
    });
  }, []);

  const setValues = useCallback((partial: Partial<T>) => {
    setAllValues((prev) => ({ ...prev, ...partial }));
  }, []);

  const setErrors = useCallback((next: FormErrors<T>) => {
    setErrorsState(next);
  }, []);

  const setFieldError = useCallback(
    (field: keyof T | 'general', message?: string) => {
      setErrorsState((prev) => {
        const next = { ...prev };
        if (message) {
          next[field] = message;
        } else {
          delete next[field];
        }
        return next;
      });
    },
    []
  );

  const clearErrors = useCallback(() => setErrorsState({}), []);

  const reset = useCallback(() => {
    setAllValues(initial);
    setErrorsState({});
  }, [initial]);

  return {
    values,
    errors,
    setValue,
    setValues,
    setErrors,
    setFieldError,
    clearErrors,
    reset,
  };
}
