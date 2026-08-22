'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Smile, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
}

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '🎉', '🚀', '✨', '😂', '👏', '🙌', '💯', '👀', '💡'];

export function MessageInput({
  onSendMessage,
  placeholder = 'Type a message...',
  disabled = false
}: MessageInputProps) {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 140)}px`;
    }
  }, [text]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const handleSend = async () => {
    if (!text.trim() || isSending || disabled) return;
    const msgToSend = text;
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsSending(true);

    try {
      await onSendMessage(msgToSend);
    } catch (err) {
      console.error('Failed to send:', err);
      // Restore text if sending totally failed
      setText(msgToSend);
    } finally {
      setIsSending(false);
      // Refocus textarea
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const isSendDisabled = !text.trim() || isSending || disabled;

  return (
    <div className="relative border-t border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-16 left-4 z-30 flex flex-wrap gap-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 shadow-xl max-w-xs animate-in fade-in zoom-in-95 duration-150"
        >
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Row */}
      <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 shadow-xs transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-800/60 dark:focus-within:border-indigo-400 dark:focus-within:bg-zinc-800">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={cn(
            'mb-1 rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition',
            showEmojiPicker && 'text-indigo-600 dark:text-indigo-400'
          )}
          title="Insert Emoji"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="max-h-36 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-zinc-900 placeholder-zinc-400 outline-none dark:text-zinc-50 dark:placeholder-zinc-500 custom-scrollbar"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isSendDisabled}
          className={cn(
            'mb-0.5 flex h-8 w-8 items-center justify-center rounded-xl font-medium transition-all duration-150',
            isSendDisabled
              ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs scale-100 hover:scale-105 active:scale-95'
          )}
          title="Send message (Enter)"
        >
          <SendHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] text-zinc-400 dark:text-zinc-500">
        <span>Use `code` or **bold** for formatting</span>
        <span className="hidden sm:inline">Press <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">Enter</kbd> to send, <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
      </div>
    </div>
  );
}
