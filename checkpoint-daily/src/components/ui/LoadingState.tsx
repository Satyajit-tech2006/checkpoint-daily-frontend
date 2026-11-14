import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  variant?: 'card' | 'row' | 'inline';
  count?: number;
  label?: string;
  className?: string;
}

export default function LoadingState({
  variant = 'card',
  count = 3,
  label = 'Loading content...',
  className,
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <div role="status" className={cn('inline-flex items-center gap-2 text-sm text-zinc-400', className)}>
        <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
        <span>{label}</span>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div role="status" aria-label={label} className={cn('space-y-3', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-14 w-full animate-pulse rounded-lg border border-zinc-800/80 bg-zinc-900/60"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label={label}
      className={cn('grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3', className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-4 space-y-3"
        >
          <div className="aspect-video w-full animate-pulse rounded-lg bg-zinc-800/80" />
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="h-5 w-4/5 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-full animate-pulse rounded bg-zinc-800/60" />
        </div>
      ))}
    </div>
  );
}