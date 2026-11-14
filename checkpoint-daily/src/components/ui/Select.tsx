import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export default function Select({
  label,
  options,
  error,
  id,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-bold uppercase tracking-wider text-zinc-300"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          className={cn(
            'h-10 w-full appearance-none rounded-lg border bg-zinc-900/90 pl-3.5 pr-9 text-sm text-zinc-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50',
            error ? 'border-red-500/80' : 'border-zinc-800 hover:border-zinc-700',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-950 text-zinc-100">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}