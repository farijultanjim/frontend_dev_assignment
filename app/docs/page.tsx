'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowLeft,
  Terminal,
  Radio,
  Key,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { api } from '@/lib/api';

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Auth' | 'Users' | 'Conversations' | 'Groups' | 'Messages' | 'System';
  summary: string;
  description: string;
  authRequired: boolean;
  requestBody?: string;
  response200: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    category: 'Auth',
    summary: 'Single-step login & auto-registration',
    description: 'Accepts phone and display name. If phone is new, automatically registers a user. Returns JWT bearer token.',
    authRequired: false,
    requestBody: JSON.stringify({ phone: '+12345678901', name: 'Alex Johnson' }, null, 2),
    response200: JSON.stringify(
      {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          _id: '6a8826abe5d6aac97521e28f',
          name: 'Alex Johnson',
          phone: '+12345678901',
          createdAt: '2026-08-21T10:21:31.538Z'
        }
      },
      null,
      2
    )
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    category: 'Auth',
    summary: 'Retrieve authenticated user session',
    description: 'Validates bearer token and returns current user details for session persistence.',
    authRequired: true,
    response200: JSON.stringify(
      {
        _id: '6a8826abe5d6aac97521e28f',
        name: 'Alex Johnson',
        phone: '+12345678901',
        createdAt: '2026-08-21T10:21:31.538Z'
      },
      null,
      2
    )
  },
  {
    method: 'GET',
    path: '/api/users/search?q={query}',
    category: 'Users',
    summary: 'Search users by name or phone',
    description: 'Searches user directory for matching names or phone digits.',
    authRequired: true,
    response200: JSON.stringify(
      [
        {
          _id: '6a8826bde5d6aac97521e2a0',
          name: 'Sarah Connor',
          phone: '+12345678902'
        }
      ],
      null,
      2
    )
  },
  {
    method: 'GET',
    path: '/api/conversations',
    category: 'Conversations',
    summary: 'List user conversations',
    description: 'Retrieves all direct and group conversations the user is a participant of.',
    authRequired: true,
    response200: JSON.stringify(
      {
        data: [
          {
            _id: '6a8826bee5d6aac97521e2a5',
            type: 'direct',
            participant: {
              _id: '6a8826bde5d6aac97521e2a0',
              name: 'Sarah Connor',
              phone: '+12345678902'
            },
            lastMessage: {
              text: 'Looking forward to our discussion.',
              sender: '6a8826abe5d6aac97521e28f',
              createdAt: '2026-08-21T13:30:10.358Z'
            },
            updatedAt: '2026-08-21T13:30:10.593Z'
          }
        ]
      },
      null,
      2
    )
  },
  {
    method: 'POST',
    path: '/api/conversations',
    category: 'Conversations',
    summary: 'Start direct 1-to-1 conversation',
    description: 'Initiates or opens an existing direct conversation with a target user ID.',
    authRequired: true,
    requestBody: JSON.stringify({ userId: '6a8826bde5d6aac97521e2a0' }, null, 2),
    response200: JSON.stringify(
      {
        _id: '6a8826bee5d6aac97521e2a5',
        participants: ['6a8826abe5d6aac97521e28f', '6a8826bde5d6aac97521e2a0'],
        createdAt: '2026-08-21T10:21:50.985Z'
      },
      null,
      2
    )
  },
  {
    method: 'POST',
    path: '/api/conversations/group',
    category: 'Groups',
    summary: 'Create group conversation',
    description: 'Creates a group with a name and minimum 2 other participant IDs. Creator is set as admin.',
    authRequired: true,
    requestBody: JSON.stringify(
      {
        name: 'Design Guild',
        participantIds: ['6a8826bde5d6aac97521e2a0', '6a88239de5d6aac97521e231']
      },
      null,
      2
    ),
    response200: JSON.stringify(
      {
        _id: '6a8826dfe5d6aac97521e2c6',
        type: 'group',
        name: 'Design Guild',
        createdBy: '6a8826abe5d6aac97521e28f',
        admins: ['6a8826abe5d6aac97521e28f'],
        participants: [
          { _id: '6a8826abe5d6aac97521e28f', name: 'Alex Johnson', phone: '+12345678901' },
          { _id: '6a8826bde5d6aac97521e2a0', name: 'Sarah Connor', phone: '+12345678902' },
          { _id: '6a88239de5d6aac97521e231', name: 'Elena Rostova', phone: '+8801700000001' }
        ]
      },
      null,
      2
    )
  },
  {
    method: 'PATCH',
    path: '/api/conversations/{id}',
    category: 'Groups',
    summary: 'Rename group',
    description: 'Allows group admins to update the group name.',
    authRequired: true,
    requestBody: JSON.stringify({ name: 'Product Core' }, null, 2),
    response200: JSON.stringify(
      {
        _id: '6a8826dfe5d6aac97521e2c6',
        name: 'Product Core',
        updatedAt: '2026-08-21T14:20:00.000Z'
      },
      null,
      2
    )
  },
  {
    method: 'GET',
    path: '/api/conversations/{id}/messages',
    category: 'Messages',
    summary: 'Get paginated message history',
    description: 'Retrieves messages for a conversation with cursor pagination using limit and before.',
    authRequired: true,
    response200: JSON.stringify(
      {
        messages: [
          {
            _id: '6a8852e2e5d6aac975224553',
            conversation: '6a8826bee5d6aac97521e2a5',
            sender: '6a8826abe5d6aac97521e28f',
            text: 'Hello from Alex!',
            createdAt: '2026-08-21T13:30:10.358Z'
          }
        ],
        hasMore: false
      },
      null,
      2
    )
  },
  {
    method: 'POST',
    path: '/api/messages',
    category: 'Messages',
    summary: 'Send a message',
    description: 'Dispatches a new message to direct or group chat. Also broadcast via WebSocket message:new.',
    authRequired: true,
    requestBody: JSON.stringify(
      {
        conversationId: '6a8826bee5d6aac97521e2a5',
        text: 'Reviewing the latest sprint tickets.'
      },
      null,
      2
    ),
    response200: JSON.stringify(
      {
        _id: '6a8852e2e5d6aac975224553',
        conversation: '6a8826bee5d6aac97521e2a5',
        sender: '6a8826abe5d6aac97521e28f',
        text: 'Reviewing the latest sprint tickets.',
        createdAt: '2026-08-21T13:30:10.358Z'
      },
      null,
      2
    )
  },
  {
    method: 'GET',
    path: '/health',
    category: 'System',
    summary: 'Health Check (Root Origin)',
    description: 'Pings server uptime status. Note: hosted on root /health rather than /api/health.',
    authRequired: false,
    response200: JSON.stringify({ status: 'ok', timestamp: '2026-08-21T13:30:00.000Z' }, null, 2)
  }
];

export default function ApiDocsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isPinging, setIsPinging] = useState(false);

  const categories = ['All', 'Auth', 'Users', 'Conversations', 'Groups', 'Messages', 'System'];

  const filteredEndpoints =
    activeCategory === 'All'
      ? ENDPOINTS
      : ENDPOINTS.filter((e) => e.category === activeCategory);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTestHealth = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      const res = await api.checkHealth();
      const latency = Math.round(performance.now() - start);
      setHealthStatus({ ...res, latencyMs: latency });
    } catch (err: any) {
      setHealthStatus({ error: err.message || 'Health check failed' });
    } finally {
      setIsPinging(false);
    }
  };

  const methodBadgeColors = {
    GET: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    POST: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
    PATCH: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    DELETE: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md px-3 sm:px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              title="Back to Landing Page"
              className="flex items-center gap-1.5 shrink-0 rounded-lg bg-zinc-900 border border-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800 transition whitespace-nowrap"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="h-4 w-4 shrink-0 text-indigo-400" />
              <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white whitespace-nowrap truncate">
                API Reference <span className="hidden md:inline font-normal text-zinc-400">· WebSocket Protocol</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center shrink-0">
            <Link
              href="/chat"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition whitespace-nowrap"
            >
              <span>Chat App</span>
              <span className="hidden sm:inline">→</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Architecture & Live Status Card */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              <Terminal className="h-4 w-4" />
              <span>Base URL</span>
            </div>
            <code className="text-xs font-mono text-zinc-200 block bg-black/40 p-2 rounded-lg break-all">
              https://frontend-task-chatapp.onrender.com/api
            </code>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              <Radio className="h-4 w-4" />
              <span>WebSocket Host</span>
            </div>
            <code className="text-xs font-mono text-zinc-200 block bg-black/40 p-2 rounded-lg break-all">
              https://frontend-task-chatapp.onrender.com
            </code>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Live Server Health
              </span>
              <button
                onClick={handleTestHealth}
                disabled={isPinging}
                className="flex items-center gap-1.5 rounded-lg bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
              >
                {isPinging ? (
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                ) : (
                  <Play className="h-3 w-3 text-emerald-400" />
                )}
                <span>Ping /health</span>
              </button>
            </div>
            {healthStatus ? (
              <div className="mt-2 text-xs text-emerald-400 font-mono flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Status: {healthStatus.status || 'OK'} ({healthStatus.latencyMs}ms)</span>
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">Click Ping to test live endpoint</p>
            )}
          </div>
        </div>

        {/* WebSocket Protocol Section */}
        <div className="mb-10 rounded-3xl border border-indigo-900/40 bg-indigo-950/20 p-6">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="rounded-xl bg-indigo-600/20 p-2 text-indigo-400 border border-indigo-500/30">
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Socket.io Real-Time Protocol</h3>
              <p className="text-xs text-zinc-400">
                Real-time duplex synchronization using Socket.io client with JWT handshake
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs font-mono">
            <div className="rounded-2xl bg-black/40 border border-zinc-800 p-4">
              <span className="text-indigo-400 font-bold uppercase tracking-wider block mb-2">
                Client → Server Events
              </span>
              <p className="text-zinc-300 font-semibold mb-1">`message:send`</p>
              <pre className="text-zinc-400 bg-zinc-950 p-2 rounded-lg overflow-x-auto">
{`socket.emit('message:send', {
  conversationId: '6a8826bee5d6...',
  text: 'Hello from client'
});`}
              </pre>
            </div>

            <div className="rounded-2xl bg-black/40 border border-zinc-800 p-4">
              <span className="text-emerald-400 font-bold uppercase tracking-wider block mb-2">
                Server → Client Events
              </span>
              <p className="text-zinc-300 font-semibold mb-1">`message:new` & `conversation:updated`</p>
              <pre className="text-zinc-400 bg-zinc-950 p-2 rounded-lg overflow-x-auto">
{`socket.on('message:new', (msg) => {
  // Append to active conversation stream
});
socket.on('conversation:updated', (conv) => {
  // Update member count, name, admin list
});`}
              </pre>
            </div>
          </div>
        </div>

        {/* REST Endpoints Grid & Detail Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Category Filter & Endpoint List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <div className="space-y-2">
              {filteredEndpoints.map((ep) => {
                const isSelected = selectedEndpoint.path === ep.path && selectedEndpoint.method === ep.method;
                return (
                  <button
                    key={`${ep.method}-${ep.path}`}
                    onClick={() => setSelectedEndpoint(ep)}
                    className={`flex w-full items-center justify-between p-3 rounded-2xl border text-left transition ${
                      isSelected
                        ? 'border-indigo-500/80 bg-indigo-950/30'
                        : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${
                          methodBadgeColors[ep.method]
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs text-zinc-200 truncate">{ep.path}</span>
                    </div>
                    {ep.authRequired && (
                      <span title="Requires Bearer Token">
                        <Key className="h-3.5 w-3.5 text-zinc-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Endpoint Detail Inspector */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold ${
                        methodBadgeColors[selectedEndpoint.method]
                      }`}
                    >
                      {selectedEndpoint.method}
                    </span>
                    <h3 className="font-mono text-sm font-semibold text-white">
                      {selectedEndpoint.path}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">{selectedEndpoint.description}</p>
                </div>

                {selectedEndpoint.authRequired && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                    <Shield className="h-3 w-3" />
                    <span>Bearer JWT</span>
                  </span>
                )}
              </div>

              {/* Request Body if applicable */}
              {selectedEndpoint.requestBody && (
                <div className="mt-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Request Body (application/json)
                    </span>
                    <button
                      onClick={() => handleCopy(selectedEndpoint.requestBody!, 'req')}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition"
                    >
                      {copiedKey === 'req' ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                  <pre className="rounded-2xl bg-black/60 border border-zinc-800 p-4 font-mono text-xs text-zinc-300 overflow-x-auto">
                    {selectedEndpoint.requestBody}
                  </pre>
                </div>
              )}

              {/* Response 200 OK Body */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                      Response
                    </span>
                    <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      200 OK
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedEndpoint.response200, 'res')}
                    className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 transition"
                  >
                    {copiedKey === 'res' ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="rounded-2xl bg-black/60 border border-zinc-800 p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-72 custom-scrollbar">
                  {selectedEndpoint.response200}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
