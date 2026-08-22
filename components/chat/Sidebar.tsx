'use client';

import React, { useState } from 'react';
import { Conversation } from '@/types/chat';
import { useChat } from '@/context/ChatContext';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { ConversationItem } from './ConversationItem';
import { UserSearchModal } from './UserSearchModal';
import { GroupCreateModal } from './GroupCreateModal';
import { CommandPalette } from './CommandPalette';
import { ConversationItemSkeleton } from '@/components/ui/Skeleton';
import {
  MessageSquarePlus,
  Users,
  Search,
  LogOut,
  Sparkles,
  Command,
  Wifi,
  WifiOff,
  Radio,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  const { user, logout } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    isLoadingConversations,
    socketStatus
  } = useChat();

  const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'group'>('all');
  const [filterQuery, setFilterQuery] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showGroupCreate, setShowGroupCreate] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Global Cmd+K keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredConversations = conversations.filter((c) => {
    if (activeTab === 'direct' && c.type !== 'direct') return false;
    if (activeTab === 'group' && c.type !== 'group') return false;

    if (!filterQuery.trim()) return true;

    const isGroup = c.type === 'group';
    let name = isGroup ? c.name : c.participant?.name;
    if (!name && Array.isArray(c.participants)) {
      const other = c.participants.find((p: any) => p._id !== user?._id);
      name = typeof other === 'object' ? other.name : '';
    }
    return (name || '').toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <aside className="flex h-full w-full sm:w-80 md:w-96 flex-col border-r border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/60 backdrop-blur-md">
      {/* User Profile & Brand Topbar */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name || 'User'} id={user?._id} size="md" isOnline={true} showOnlineStatus={true} />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {user?.name || 'Guest'}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>{user?.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Link
              href="/docs"
              title="API Documentation"
              className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <BookOpen className="h-4 w-4" />
            </Link>
            <button
              onClick={logout}
              title="Sign Out"
              className="rounded-lg p-2 text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 transition"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Real-time Status Badge */}
        <div className="mt-3 flex items-center justify-between rounded-lg bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1 text-[11px]">
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                socketStatus === 'connected'
                  ? 'bg-emerald-500 animate-pulse'
                  : socketStatus === 'connecting'
                  ? 'bg-amber-500 animate-ping'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-zinc-600 dark:text-zinc-400 capitalize">
              {socketStatus === 'connected'
                ? 'WebSocket Realtime Active'
                : socketStatus === 'connecting'
                ? 'Connecting to Socket...'
                : 'Offline / Reconnecting'}
            </span>
          </div>

          <button
            onClick={() => setShowCommandPalette(true)}
            className="flex items-center gap-1 rounded bg-zinc-200/70 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 transition"
          >
            <Command className="h-3 w-3" />
            <span>K</span>
          </button>
        </div>
      </div>

      {/* Action Buttons & Filter Row */}
      <div className="p-3 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowUserSearch(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition active:scale-98"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>New Chat</span>
          </button>

          <button
            onClick={() => setShowGroupCreate(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 shadow-2xs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition active:scale-98"
          >
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>New Group</span>
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search chats..."
            className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 p-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
          {(['all', 'direct', 'group'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-lg py-1 text-center capitalize transition ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-2xs'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {tab === 'all' ? 'All Chats' : tab === 'direct' ? 'Direct' : 'Groups'}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Stream List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
        {isLoadingConversations ? (
          <div className="space-y-2 py-2">
            <ConversationItemSkeleton />
            <ConversationItemSkeleton />
            <ConversationItemSkeleton />
            <ConversationItemSkeleton />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {filterQuery ? `No chats matching "${filterQuery}"` : 'No conversations found yet.'}
            </p>
            {!filterQuery && (
              <button
                onClick={() => setShowUserSearch(true)}
                className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Start a direct conversation
              </button>
            )}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv._id}
              conversation={conv}
              isActive={activeConversation?._id === conv._id}
              onClick={() => setActiveConversation(conv)}
            />
          ))
        )}
      </div>

      {/* Footer shortcut info */}
      <div className="border-t border-zinc-200/80 dark:border-zinc-800 px-4 py-2 text-[11px] text-zinc-400 flex items-center justify-between">
        <span>Chats: {conversations.length}</span>
        <span className="hidden sm:inline">Press ⌘K to search</span>
      </div>

      {/* Modals */}
      <UserSearchModal isOpen={showUserSearch} onClose={() => setShowUserSearch(false)} />
      <GroupCreateModal isOpen={showGroupCreate} onClose={() => setShowGroupCreate(false)} />
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenUserSearch={() => setShowUserSearch(true)}
        onOpenGroupCreate={() => setShowGroupCreate(true)}
      />
    </aside>
  );
}
