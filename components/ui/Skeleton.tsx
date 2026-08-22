import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-zinc-200/70 dark:bg-zinc-800/70', className)}
      {...props}
    />
  );
}

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl">
      <Skeleton className="h-11 w-11 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-10" />
        </div>
        <Skeleton className="h-3.5 w-44" />
      </div>
    </div>
  );
}

export function MessageBubbleSkeleton({ isSelf }: { isSelf?: boolean }) {
  return (
    <div className={cn('flex items-end gap-2.5 my-3', isSelf ? 'justify-end' : 'justify-start')}>
      {!isSelf && <Skeleton className="h-8 w-8 rounded-full shrink-0" />}
      <div
        className={cn(
          'space-y-1.5 p-3.5 rounded-2xl max-w-[70%]',
          isSelf ? 'bg-indigo-500/10' : 'bg-zinc-100 dark:bg-zinc-800/50'
        )}
      >
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
