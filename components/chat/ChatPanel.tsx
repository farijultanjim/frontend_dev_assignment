'use client';

import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { Conversation, Message } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { GroupSettingsModal } from './GroupSettingsModal';
import { MessageBubbleSkeleton } from '@/components/ui/Skeleton';
import { formatDateSeparator } from '@/lib/utils';
import {
  Users,
  Settings,
  ArrowDown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Phone,
  MessageSquareOff
} from 'lucide-react';

interface ChatPanelProps {
  onOpenSidebar?: () => void;
}

export function ChatPanel({ onOpenSidebar }: ChatPanelProps) {
  const { user } = useAuth();
  const {
    activeConversation,
    messages,
    hasMoreMessages,
    isLoadingMessages,
    isLoadingOlder,
    fetchOlderMessages,
    sendMessage
  } = useChat();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(0);

  const isGroup = activeConversation?.type === 'group';
  const currentUserId = user?._id;

  // Determine display header info
  let headerTitle = 'Conversation';
  let headerSubtitle = '';
  let avatarId = activeConversation?._id || '';

  if (activeConversation) {
    if (isGroup) {
      headerTitle = activeConversation.name || 'Unnamed Group';
      avatarId = activeConversation.name || activeConversation._id;
      const count = Array.isArray(activeConversation.participants)
        ? activeConversation.participants.length
        : 0;
      headerSubtitle = `${count} members`;
    } else if (activeConversation.participant) {
      headerTitle = activeConversation.participant.name || 'Direct Chat';
      avatarId = activeConversation.participant._id;
      headerSubtitle = activeConversation.participant.phone || 'Online';
    } else if (Array.isArray(activeConversation.participants)) {
      const other = activeConversation.participants.find((p: any) => {
        const pId = typeof p === 'string' ? p : p._id;
        return pId !== currentUserId;
      });
      if (typeof other === 'object' && other?.name) {
        headerTitle = other.name;
        avatarId = other._id;
        headerSubtitle = other.phone || 'Online';
      }
    }
  }

  // Scroll handler to track whether user is at bottom
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const threshold = 80; // px from bottom
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = distanceFromBottom < threshold;

    setIsAtBottom(atBottom);

    if (atBottom) {
      setHasNewMessagesBelow(false);
    }

    // Infinite scroll up trigger: if scrolled near top and hasMore
    if (container.scrollTop < 60 && hasMoreMessages && !isLoadingOlder && !isLoadingMessages) {
      previousScrollHeightRef.current = container.scrollHeight;
      fetchOlderMessages();
    }
  };

  // Preserve scroll anchor when older messages are prepended
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !previousScrollHeightRef.current) return;

    if (previousScrollHeightRef.current > 0) {
      const heightDifference = container.scrollHeight - previousScrollHeightRef.current;
      if (heightDifference > 0) {
        container.scrollTop += heightDifference;
      }
      previousScrollHeightRef.current = 0;
    }
  }, [messages]);

  // Handle incoming or sent messages smart scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNewMessage = messages.length > prevMessagesLengthRef.current;
    const latestMessage = messages[messages.length - 1];
    const isSentByMe =
      latestMessage &&
      (typeof latestMessage.sender === 'object'
        ? latestMessage.sender._id === currentUserId
        : latestMessage.sender === currentUserId);

    if (isNewMessage) {
      // If user sent it, always auto-scroll to bottom
      if (isSentByMe || isAtBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setHasNewMessagesBelow(false);
      } else {
        // User is scrolled up reading history, don't force scroll down!
        setHasNewMessagesBelow(true);
      }
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, isAtBottom, currentUserId]);

  // Initial scroll to bottom when conversation loads
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setIsAtBottom(true);
      setHasNewMessagesBelow(false);
    }
  }, [activeConversation?._id, isLoadingMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    setHasNewMessagesBelow(false);
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/40">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mb-4 border border-indigo-500/20">
          <Sparkles className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Select a conversation
        </h3>
        <p className="mt-2 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          Choose a direct message or group chat from the sidebar, or search for a team member to
          start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col h-full bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 px-5 py-3.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xs z-10">
        <div className="flex items-center gap-3.5">
          <Avatar
            name={headerTitle}
            id={avatarId}
            size="md"
            showOnlineStatus={!isGroup}
            isOnline={true}
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 truncate max-w-xs sm:max-w-md">
                {headerTitle}
              </h3>
              {isGroup && (
                <Badge variant="primary" size="sm">
                  <Users className="h-3 w-3" />
                  <span>Group</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
              {headerSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isGroup && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
              title="Group Settings & Members"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Stream Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 py-4 space-y-1 relative custom-scrollbar"
      >
        {/* Loading older messages spinner */}
        {isLoadingOlder && (
          <div className="flex justify-center py-2">
            <div className="flex items-center gap-2 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs text-zinc-500 shadow-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
              <span>Loading older messages...</span>
            </div>
          </div>
        )}

        {/* Load More manual button if scrolled near top */}
        {hasMoreMessages && !isLoadingOlder && !isLoadingMessages && (
          <div className="flex justify-center py-1">
            <button
              onClick={fetchOlderMessages}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {/* Initial loading skeletons */}
        {isLoadingMessages && (
          <div className="space-y-4 px-4 py-6">
            <MessageBubbleSkeleton isSelf={false} />
            <MessageBubbleSkeleton isSelf={true} />
            <MessageBubbleSkeleton isSelf={false} />
            <MessageBubbleSkeleton isSelf={true} />
          </div>
        )}

        {/* Empty messages state */}
        {!isLoadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mb-3">
              <MessageSquareOff className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              No messages yet
            </h4>
            <p className="mt-1 text-xs text-zinc-500 max-w-xs">
              Send the first message below to start this conversation!
            </p>
          </div>
        )}

        {/* Messages List with Smart Date Separators */}
        {!isLoadingMessages &&
          messages.map((msg, index) => {
            const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
            const senderId = senderObj ? senderObj._id : (msg.sender as string);
            const isSelf = senderId === currentUserId;

            // Date separator check
            const currentDate = formatDateSeparator(msg.createdAt);
            const prevMessage = messages[index - 1];
            const prevDate = prevMessage ? formatDateSeparator(prevMessage.createdAt) : null;
            const showDateSeparator = currentDate !== prevDate;

            // Group avatar bundling: only show avatar if next message is not from same sender
            const nextMessage = messages[index + 1];
            const nextSenderId = nextMessage
              ? typeof nextMessage.sender === 'object'
                ? nextMessage.sender._id
                : nextMessage.sender
              : null;
            const showAvatar = nextSenderId !== senderId;

            return (
              <React.Fragment key={msg._id || index}>
                {showDateSeparator && (
                  <div className="flex items-center justify-center my-4">
                    <span className="rounded-full bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xs">
                      {currentDate}
                    </span>
                  </div>
                )}

                <MessageBubble
                  message={msg}
                  isSelf={isSelf}
                  showAvatar={showAvatar}
                  showSenderName={!isSelf}
                  isGroup={isGroup}
                />
              </React.Fragment>
            );
          })}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Floating "New Messages" Pill button */}
      {hasNewMessagesBelow && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-8 z-20 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xl hover:bg-indigo-700 transition transform hover:scale-105 active:scale-95 animate-bounce"
        >
          <ArrowDown className="h-4 w-4" />
          <span>New messages below</span>
        </button>
      )}

      {/* Message Input Box */}
      <MessageInput
        onSendMessage={sendMessage}
        placeholder={isGroup ? `Message #${headerTitle}...` : `Message ${headerTitle}...`}
      />

      {/* Group Settings Modal */}
      {isGroup && (
        <GroupSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          conversation={activeConversation}
        />
      )}
    </div>
  );
}
