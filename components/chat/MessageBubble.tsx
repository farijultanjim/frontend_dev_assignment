'use client';

import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Avatar } from '@/components/ui/Avatar';
import { cn, formatMessageTime, getAvatarColor } from '@/lib/utils';
import { Check, Clock, AlertCircle, Copy, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  isGroup?: boolean;
}

export function MessageBubble({
  message,
  isSelf,
  showAvatar = true,
  showSenderName = true,
  isGroup = false
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const senderObj = typeof message.sender === 'object' ? message.sender : null;
  const senderId = senderObj ? senderObj._id : (message.sender as string);
  const senderName = senderObj?.name || 'Member';

  const timeFormatted = formatMessageTime(message.createdAt);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format text with simple markdown (bold, italic, inline code)
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Check for code blocks ```code```
    if (text.startsWith('```') && text.endsWith('```')) {
      const code = text.slice(3, -3).trim();
      return (
        <pre className="my-1 overflow-x-auto rounded-lg bg-black/20 p-2.5 font-mono text-xs text-white/90">
          <code>{code}</code>
        </pre>
      );
    }

    // Split text into tokens for inline formatting
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="rounded bg-black/10 dark:bg-white/10 px-1 py-0.5 font-mono text-[0.88em]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div
      className={cn(
        'group relative flex items-end gap-2 px-4 py-1 transition-all',
        isSelf ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Sender Avatar for Group Messages */}
      {!isSelf && showAvatar && (
        <Avatar name={senderName} id={senderId} size="sm" className="mb-0.5" />
      )}
      {!isSelf && !showAvatar && <div className="w-8 shrink-0" />}

      {/* Message Bubble Container */}
      <div className="relative max-w-[78%] sm:max-w-[65%]">
        {/* Sender Name in Groups */}
        {!isSelf && showSenderName && isGroup && (
          <span className="mb-1 ml-1 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            {senderName}
          </span>
        )}

        <div
          className={cn(
            'relative overflow-hidden rounded-2xl px-4 py-2.5 text-sm shadow-xs transition-colors',
            isSelf
              ? 'rounded-br-xs bg-indigo-600 text-white selection:bg-indigo-400 selection:text-white'
              : 'rounded-bl-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700/50'
          )}
        >
          {/* Message Content */}
          <div className="leading-relaxed break-words whitespace-pre-wrap">
            {renderFormattedText(message.text)}
          </div>

          {/* Timestamp and Status Indicator */}
          <div
            className={cn(
              'mt-1 flex items-center justify-end gap-1 text-[10px]',
              isSelf ? 'text-indigo-200' : 'text-zinc-400 dark:text-zinc-500'
            )}
          >
            <span>{timeFormatted}</span>

            {isSelf && (
              <span className="flex items-center">
                {message.isOptimistic ? (
                  <span title="Sending...">
                    <Clock className="h-3 w-3 animate-pulse text-indigo-300" />
                  </span>
                ) : message.isFailed ? (
                  <span title="Failed to send">
                    <AlertCircle className="h-3 w-3 text-rose-300" />
                  </span>
                ) : (
                  <span title="Delivered">
                    <CheckCheck className="h-3 w-3 text-indigo-200" />
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Quick Copy Button on Hover */}
          <button
            onClick={handleCopy}
            title="Copy text"
            className={cn(
              'absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md',
              isSelf
                ? 'bg-indigo-700/80 hover:bg-indigo-700 text-indigo-100'
                : 'bg-zinc-200/80 dark:bg-zinc-700/80 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-600 dark:text-zinc-300'
            )}
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  );
}
