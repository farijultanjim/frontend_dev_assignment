'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ChatProvider, useChat } from '@/context/ChatContext';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Loader2, Menu, X, MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function ChatDashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { activeConversation, setActiveConversation } = useChat();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg animate-pulse">
            <MessageSquare className="h-6 w-6" />
          </div>
          <p className="text-xs font-medium text-zinc-400">Loading NexusChat workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      {/* Mobile Top Header (Small Screens Only) */}
      <div className="flex sm:hidden items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 fixed top-0 left-0 right-0 z-30">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="rounded-lg p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          {mobileSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          {activeConversation ? (activeConversation.name || 'Chat') : 'NexusChat'}
        </span>

        <Link
          href="/"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Home
        </Link>
      </div>

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 sm:relative sm:z-auto sm:flex transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        }`}
      >
        <Sidebar />
      </div>

      {/* Mobile Backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs sm:hidden"
        />
      )}

      {/* Main Chat Workspace */}
      <main className="flex flex-1 flex-col h-full overflow-hidden pt-12 sm:pt-0">
        <ChatPanel />
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatDashboard />
    </ChatProvider>
  );
}
