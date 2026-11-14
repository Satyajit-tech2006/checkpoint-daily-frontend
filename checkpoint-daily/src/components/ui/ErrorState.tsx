import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = 'Transmission Interrupted',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-950/10 px-6 py-10 text-center"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-400">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-3.5 font-display text-base font-bold text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-zinc-400">{message}</p>
      {onRetry && (
        <div className="mt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}