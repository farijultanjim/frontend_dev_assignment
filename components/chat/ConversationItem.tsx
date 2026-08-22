'use client';

import React from 'react';
import { Conversation } from '@/types/chat';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { cn, formatConversationTime, truncate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Users, User as UserIcon } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isActive, onClick }: ConversationItemProps) {
  const { user } = useAuth();
  const isGroup = conversation.type === 'group';

  // Determine display name
  let displayName = 'Conversation';
  let avatarId = conversation._id;

  if (isGroup) {
    displayName = conversation.name || 'Unnamed Group';
    avatarId = conversation.name || conversation._id;
  } else if (conversation.participant) {
    displayName = conversation.participant.name || conversation.participant.phone || 'Direct Chat';
    avatarId = conversation.participant._id;
  } else if (Array.isArray(conversation.participants) && conversation.participants.length > 0) {
    // If participants are objects or IDs
    const otherParticipant = conversation.participants.find((p: any) => {
      const pId = typeof p === 'string' ? p : p._id;
      return pId !== user?._id;
    });
    if (typeof otherParticipant === 'object' && otherParticipant?.name) {
      displayName = otherParticipant.name;
      avatarId = otherParticipant._id;
    } else {
      displayName = 'Direct Chat';
    }
  }

  const lastMsg = conversation.lastMessage;
  const lastMsgText = lastMsg?.text ? truncate(lastMsg.text, 36) : 'No messages yet';
  const timestamp = formatConversationTime(conversation.updatedAt || conversation.createdAt);
  const unread = conversation.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center gap-3.5 px-3.5 py-3 text-left rounded-xl transition-all duration-150',
        isActive
          ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-zinc-900 dark:text-zinc-50 font-medium'
          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50'
      )}
    >
      {/* Active Indicator Bar */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
      )}

      {/* Avatar */}
      <Avatar name={displayName} id={avatarId} size="md" />

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 truncate">
            <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {displayName}
            </span>
            {isGroup ? (
              <span title="Group conversation" className="text-zinc-400">
                <Users className="h-3.5 w-3.5" />
              </span>
            ) : (
              <span title="1-on-1 direct conversation" className="text-zinc-400">
                <UserIcon className="h-3 w-3" />
              </span>
            )}
          </div>
          {timestamp && (
            <span
              className={cn(
                'shrink-0 text-[11px] transition-colors',
                unread > 0
                  ? 'font-semibold text-indigo-600 dark:text-indigo-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              )}
            >
              {timestamp}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              'truncate text-xs',
              unread > 0
                ? 'font-medium text-zinc-900 dark:text-zinc-100'
                : 'text-zinc-500 dark:text-zinc-400'
            )}
          >
            {lastMsgText}
          </p>
          {unread > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-xs">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
