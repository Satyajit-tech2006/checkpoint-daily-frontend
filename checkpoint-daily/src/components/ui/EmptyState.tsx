import React from 'react';
import { FolderSearch } from 'lucide-react';
import Button from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400">
        <FolderSearch className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold text-white">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-zinc-400">{description}</p>

      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-zinc-950 transition-colors hover:bg-amber-400"
        >
          {actionLabel}
        </a>
      )}

      {actionLabel && !actionHref && onAction && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}