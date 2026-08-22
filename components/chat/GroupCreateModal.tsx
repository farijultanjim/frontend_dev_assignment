'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { UserSearchResponse } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Loader2, Users, X, Check, AlertCircle } from 'lucide-react';

interface GroupCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GroupCreateModal({ isOpen, onClose }: GroupCreateModalProps) {
  const { user: currentUser } = useAuth();
  const { createGroupChat } = useChat();
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResponse[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const users = await api.searchUsers(searchQuery);
        const filtered = users.filter((u) => u._id !== currentUser?._id);
        setSearchResults(filtered);
      } catch (err) {
        console.error('Failed to search:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, currentUser]);

  const toggleUserSelection = (user: UserSearchResponse) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u._id === user._id);
      if (exists) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide a group name.');
      return;
    }

    if (selectedUsers.length < 2) {
      setError('A group conversation requires at least 2 other participants (3 total members).');
      return;
    }

    setIsCreating(true);
    try {
      const participantIds = selectedUsers.map((u) => u._id);
      await createGroupChat(name.trim(), participantIds);
      onClose();
    } catch (err: any) {
      console.error('Failed to create group:', err);
      setError(err?.message || 'Failed to create group. Please verify participants.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group Chat"
      description="Collaborate with multiple team members in a shared channel."
      maxWidth="md"
    >
      <form onSubmit={handleCreateGroup} className="space-y-4">
        {/* Error alert */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Group Name Input */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Group Name
          </label>
          <div className="relative">
            <Users className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Systems, Project Alpha"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Selected Participants Chips */}
        {selectedUsers.length > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              <span>Selected Participants ({selectedUsers.length})</span>
              <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                {selectedUsers.length < 2 ? `Add ${2 - selectedUsers.length} more` : 'Ready to create'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 max-h-24 overflow-y-auto custom-scrollbar">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/50 pl-1.5 pr-2 py-0.5 text-xs text-indigo-700 dark:text-indigo-300"
                >
                  <Avatar name={u.name} id={u._id} size="sm" className="h-4 w-4 text-[9px]" />
                  <span className="font-medium">{u.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(u)}
                    className="rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800 p-0.5 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Add Members Search */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Add Members
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or phone to add..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-indigo-400"
            />
            {isSearching && (
              <Loader2 className="absolute right-3.5 top-3 h-4 w-4 animate-spin text-zinc-400" />
            )}
          </div>
        </div>

        {/* Search Results list */}
        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {searchResults.map((u) => {
            const isSelected = selectedUsers.some((sel) => sel._id === u._id);
            return (
              <button
                type="button"
                key={u._id}
                onClick={() => toggleUserSelection(u)}
                className={`flex w-full items-center justify-between p-2 rounded-xl transition text-left ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar name={u.name} id={u._id} size="sm" />
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{u.phone}</p>
                  </div>
                </div>

                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-zinc-300 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit button */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating || selectedUsers.length < 2 || !name.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Group</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
