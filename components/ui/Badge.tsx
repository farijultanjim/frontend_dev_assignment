import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline' | 'admin';
  size?: 'sm' | 'md';
}

const variantClasses = {
  default: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700',
  primary: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
  success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  destructive: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  outline: 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300',
  admin: 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30 font-semibold'
};

const sizeClasses = {
  sm: 'text-[10px] px-1.5 py-0.5 rounded-sm',
  md: 'text-xs px-2.5 py-0.5 rounded-full'
};

export function Badge({
  className,
  variant = 'default',
  size = 'sm',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-medium transition-colors',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
