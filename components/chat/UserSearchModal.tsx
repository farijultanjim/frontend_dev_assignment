'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { UserSearchResponse } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, MessageSquare, Phone } from 'lucide-react';

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const { user: currentUser } = useAuth();
  const { startDirectChat } = useChat();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const users = await api.searchUsers(query);
        // Filter out current user
        const filtered = users.filter((u) => u._id !== currentUser?._id);
        setResults(filtered);
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, currentUser]);

  const handleStartChat = async (targetUser: UserSearchResponse) => {
    setIsStarting(targetUser._id);
    try {
      await startDirectChat(targetUser._id);
      onClose();
    } catch (err) {
      console.error('Failed to start conversation:', err);
    } finally {
      setIsStarting(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start a Direct Chat"
      description="Search users by name or phone number to start a new 1-on-1 conversation."
    >
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name or phone number..."
            autoFocus
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-indigo-400 dark:focus:bg-zinc-800"
          />
          {isLoading && (
            <Loader2 className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-zinc-400" />
          )}
        </div>

        {/* Results List */}
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {query.trim() && !isLoading && results.length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              No users found matching <span className="font-semibold">"{query}"</span>
            </div>
          )}

          {!query.trim() && (
            <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Search for team members or friends to begin messaging.
            </div>
          )}

          {results.map((u) => (
            <div
              key={u._id}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar name={u.name} id={u._id} size="sm" />
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{u.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                    <Phone className="h-3 w-3" />
                    <span>{u.phone}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleStartChat(u)}
                disabled={isStarting === u._id}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {isStarting === u._id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
