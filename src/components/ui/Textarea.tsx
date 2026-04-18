import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  error?: string;
  hint?: React.ReactNode;
  wrapperClassName?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, hint, wrapperClassName, className, showCount, id, maxLength, value, ...props },
    ref
  ) => {
    const textareaId = id ?? props.name;
    const errorId = textareaId ? `${textareaId}-error` : undefined;
    const hintId = textareaId && hint ? `${textareaId}-hint` : undefined;
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={wrapperClassName}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          className={cn(
            'w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400',
            'focus:ring-2 focus:ring-emerald-500 transition-colors resize-y',
            error
              ? 'border-red-300 focus:border-red-500'
              : 'border-gray-300 focus:border-emerald-500',
            className
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(errorId && error, hintId) || undefined}
          {...props}
        />
        <div className="mt-1 flex items-start justify-between gap-3">
          <div className="flex-1">
            {hint && !error && (
              <p id={hintId} className="text-xs text-gray-500">
                {hint}
              </p>
            )}
            {error && (
              <p id={errorId} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          {showCount && maxLength && (
            <span className="text-xs text-gray-500 tabular-nums shrink-0">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
