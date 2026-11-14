import React, { useId } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'flex h-10 w-full rounded-lg border bg-zinc-900/90 px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-red-500/80 focus-visible:ring-red-500' : 'border-zinc-800 hover:border-zinc-700',
          className
        )}
        {...props}
      />

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-red-400">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="text-xs text-zinc-500">
          {hint}
        </p>
      )}
    </div>
  );
}