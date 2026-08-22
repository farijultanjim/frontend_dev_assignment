'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Search, MessageSquare, Users, Volume2, VolumeX, LogOut, Sparkles } from 'lucide-react';
import { soundManager } from '@/lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUserSearch: () => void;
  onOpenGroupCreate: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenUserSearch,
  onOpenGroupCreate
}: CommandPaletteProps) {
  const { user, logout } = useAuth();
  const { conversations, setActiveConversation } = useChat();
  const [search, setSearch] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(soundManager.getMuted());
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const filteredConversations = conversations.filter((c) => {
    const isGroup = c.type === 'group';
    let name = isGroup ? c.name : c.participant?.name;
    if (!name && Array.isArray(c.participants)) {
      const other = c.participants.find((p: any) => p._id !== user?._id);
      name = typeof other === 'object' ? other.name : 'Direct Chat';
    }
    return (name || '').toLowerCase().includes(search.toLowerCase());
  });

  const handleSelectConv = (conv: any) => {
    setActiveConversation(conv);
    onClose();
  };

  const handleToggleSound = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    soundManager.setMuted(newMuted);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette" maxWidth="md">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations, shortcuts, actions..."
            autoFocus
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>

        {/* Quick Actions */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Quick Actions
          </span>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenUserSearch();
              }}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-2.5 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition"
            >
              <MessageSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>New Direct Chat</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenGroupCreate();
              }}
              className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-2.5 text-left text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-indigo-500/40 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition"
            >
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Create Group</span>
            </button>
          </div>
        </div>

        {/* Conversations List */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Conversations ({filteredConversations.length})
          </span>
          <div className="mt-1.5 max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {filteredConversations.map((c) => {
              const isGroup = c.type === 'group';
              const name = isGroup
                ? c.name || 'Group'
                : c.participant?.name || 'Direct Chat';
              return (
                <button
                  key={c._id}
                  onClick={() => handleSelectConv(c)}
                  className="flex w-full items-center justify-between p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition text-left"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Avatar name={name} id={c._id} size="sm" />
                    <span className="truncate text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      {name}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-zinc-400 uppercase">
                    {c.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System toggles */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={handleToggleSound}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-indigo-600" />}
            <span>Sound Effects: {isMuted ? 'Muted' : 'Enabled'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
