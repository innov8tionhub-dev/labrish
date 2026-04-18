import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  wrapperClassName?: string;
  showCount?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      hint,
      leadingIcon,
      trailingIcon,
      wrapperClassName,
      showCount,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? props.name;
    const errorId = inputId ? `${inputId}-error` : undefined;
    const hintId = inputId && hint ? `${inputId}-hint` : undefined;
    const currentLength =
      typeof props.value === 'string' ? props.value.length : 0;
    const maxLength = props.maxLength;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leadingIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leadingIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400',
              'focus:ring-2 focus:ring-emerald-500 transition-colors',
              leadingIcon ? 'pl-10' : 'pl-4',
              trailingIcon ? 'pr-12' : 'pr-4',
              error
                ? 'border-red-300 focus:border-red-500'
                : 'border-gray-300 focus:border-emerald-500',
              className
            )}
            aria-invalid={error ? true : undefined}
            aria-describedby={cn(errorId && error, hintId) || undefined}
            {...props}
          />
          {trailingIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {trailingIcon}
            </span>
          )}
        </div>
        {hint && !error && (
          <p id={hintId} className="mt-1 text-xs text-gray-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {showCount && maxLength ? (
          <p className="mt-1 text-xs text-gray-500">
            {currentLength}/{maxLength} characters
          </p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
