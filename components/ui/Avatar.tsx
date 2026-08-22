'use client';

import React from 'react';
import { cn, getAvatarColor, getInitials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  className?: string;
  showOnlineStatus?: boolean;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg font-semibold'
};

const statusSizeClasses = {
  sm: 'h-2 w-2 bottom-0 right-0',
  md: 'h-2.5 w-2.5 bottom-0 right-0',
  lg: 'h-3 w-3 bottom-0.5 right-0.5',
  xl: 'h-3.5 w-3.5 bottom-1 right-1'
};

export function Avatar({
  name,
  id,
  size = 'md',
  isOnline = false,
  className,
  showOnlineStatus = false
}: AvatarProps) {
  const colorClass = getAvatarColor(id || name);
  const initials = getInitials(name);

  return (
    <div className="relative inline-flex shrink-0 select-none items-center justify-center">
      <div
        className={cn(
          'flex items-center justify-center rounded-full font-medium tracking-wide shadow-xs border transition-transform duration-200',
          sizeClasses[size],
          colorClass,
          className
        )}
      >
        {initials}
      </div>
      {showOnlineStatus && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-white dark:ring-zinc-950',
            statusSizeClasses[size],
            isOnline ? 'bg-emerald-500' : 'bg-zinc-400'
          )}
        />
      )}
    </div>
  );
}
