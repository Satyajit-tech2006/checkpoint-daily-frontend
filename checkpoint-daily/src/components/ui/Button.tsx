import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'community' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 shadow-sm',
    community: 'bg-cyan-500 text-zinc-950 font-bold hover:bg-cyan-400 shadow-sm',
    secondary: 'border border-zinc-700 bg-zinc-900 text-zinc-100 font-semibold hover:border-zinc-600 hover:bg-zinc-800',
    ghost: 'text-zinc-300 font-medium hover:bg-zinc-900 hover:text-white',
    danger: 'border border-red-500/30 bg-red-500/10 text-red-400 font-semibold hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-lg gap-2',
    lg: 'h-12 px-6 text-sm rounded-lg gap-2.5 uppercase tracking-wider',
  };

  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
}