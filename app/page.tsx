'use client';

import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Radio,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Terminal,
  Keyboard,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowDownCircle,
  FileCode
} from 'lucide-react';
import { InteractiveDemo } from '@/components/landing/InteractiveDemo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-indigo-600/15 blur-[160px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[400px] w-[500px] rounded-full bg-violet-600/10 blur-[140px]" />

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">NexusChat</span>
          </Link>

          {/* Center Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition">
              Features
            </a>
            <a href="#demo" className="hover:text-zinc-100 transition">
              Live Sandbox
            </a>
            <a href="#architecture" className="hover:text-zinc-100 transition">
              Architecture
            </a>
            <Link href="/docs" className="hover:text-zinc-100 transition flex items-center gap-1">
              <FileCode className="h-3.5 w-3.5 text-indigo-400" />
              <span>API Specs</span>
            </Link>
          </nav>

          {/* Right Action */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-zinc-300 hover:text-white transition px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition active:scale-98"
            >
              <span>Open Chat App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center">
        <div className="mx-auto max-w-4xl">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Next.js 16 + Socket.io Real-Time Protocol</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-tight">
            Enterprise Messaging Built for Speed, Polish, & Precision.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            A production-ready chat platform featuring 1-on-1 direct channels, multi-user group
            governance, sub-millisecond smart auto-scroll detection, and dual-layer WebSocket sync.
          </p>

          {/* Dual Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/chat"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-8 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-98"
            >
              <span>Launch Live Application</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/docs"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 px-7 text-sm font-semibold text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white transition"
            >
              <FileCode className="h-4 w-4 text-indigo-400" />
              <span>Explore API Documentation</span>
            </Link>
          </div>

          {/* Metric Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 border-y border-zinc-800/80 py-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">&lt; 50ms</p>
              <p className="text-xs text-zinc-400 mt-0.5">Real-time Latency</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">100%</p>
              <p className="text-xs text-zinc-400 mt-0.5">Type-Safe Contracts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">Smart Scroll</p>
              <p className="text-xs text-zinc-400 mt-0.5">Position Lock Engine</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">2-Way Sync</p>
              <p className="text-xs text-zinc-400 mt-0.5">WebSocket + REST fallback</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="py-12 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Try It In Browser
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
              Interactive Live Chat Sandbox
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-lg mx-auto">
              Switch between personas, type live messages, and test optimistic updates directly on
              this page.
            </p>
          </div>

          <InteractiveDemo />
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <section id="features" className="py-20 px-6 border-t border-zinc-900 bg-zinc-950/60">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Core Engineering Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1.5">
              Engineered with Senior Standards
            </h2>
            <p className="text-sm text-zinc-400 mt-2 max-w-xl mx-auto">
              Every interaction is thoughtfully designed to eliminate common edge-case bugs and
              provide an uninterrupted experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Smart Scroll Engine (Spans 2 columns) */}
            <div className="md:col-span-2 rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-8 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mb-5">
                  <ArrowDownCircle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Smart Scroll-Lock & Cursor Pagination</h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Avoids disruptive force-scrolling while users read history. If a new message arrives
                  while scrolled up, a floating indicator notifies the reader. Loading older messages
                  calculates scroll delta to anchor reading position seamlessly.
                </p>
              </div>

              <div className="mt-6 rounded-2xl bg-black/60 border border-zinc-800 p-4 font-mono text-[11px] text-zinc-300">
                <span className="text-indigo-400 font-semibold">// Viewport Anchor Calculation</span>
                <p className="text-zinc-400 mt-1">
                  const heightDiff = container.scrollHeight - prevHeight;
                  <br />
                  container.scrollTop += heightDiff; // Zero viewport jump
                </p>
              </div>
            </div>

            {/* Bento Card 2: Socket.io Protocol */}
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-8 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 mb-5">
                  <Radio className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Duplex WebSocket Sync</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Real-time incoming message dispatch (`message:new`) and group metadata sync
                  (`conversation:updated`) with automatic heartbeat reconnection.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>JWT Handshake Authentication</span>
              </div>
            </div>

            {/* Bento Card 3: Group Governance */}
            <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-8 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600/10 text-amber-400 border border-amber-500/20 mb-5">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Group Administration</h3>
                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  Full admin role capabilities: member invitations, promotions to admin, member
                  removals, channel renaming, and voluntary leaves.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-amber-400 font-medium">
                <Shield className="h-4 w-4" />
                <span>Role-Based Access Enforcement</span>
              </div>
            </div>

            {/* Bento Card 4: Keyboard Speed (Spans 2 columns) */}
            <div className="md:col-span-2 rounded-3xl border border-zinc-800/80 bg-zinc-900/50 p-8 flex flex-col justify-between hover:border-zinc-700 transition">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/20 mb-5">
                  <Keyboard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Command Palette & Power User UX</h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Hit <kbd className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> anywhere
                  to quickly search chats or launch actions. Markdown code block formatting, sound effect
                  synthesizer, and optimistic delivery indicators.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-4 text-xs text-zinc-400">
                <span>• Web Audio Sound Chimes</span>
                <span>• Emoji Picker Popover</span>
                <span>• Dark / Light Symmetry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Deep Dive Section */}
      <section id="architecture" className="py-20 px-6 border-t border-zinc-900">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Full Stack Blueprint
            </span>
            <h2 className="text-3xl font-bold text-white mt-1">Application Architecture</h2>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 font-mono text-xs text-zinc-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="font-bold text-white">Client Layer (Next.js 16 + React 19)</span>
              <span className="text-indigo-400">App Router</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-black/50 p-3 border border-zinc-800">
                <span className="text-indigo-400 font-bold block mb-1">State & Cache</span>
                <p className="text-[11px] text-zinc-400">
                  React Context + Optimistic UI reducer + Token manager
                </p>
              </div>
              <div className="rounded-xl bg-black/50 p-3 border border-zinc-800">
                <span className="text-emerald-400 font-bold block mb-1">Transport</span>
                <p className="text-[11px] text-zinc-400">
                  Socket.io Client (duplex) + Fetch REST client
                </p>
              </div>
              <div className="rounded-xl bg-black/50 p-3 border border-zinc-800">
                <span className="text-amber-400 font-bold block mb-1">Styling</span>
                <p className="text-[11px] text-zinc-400">
                  Tailwind CSS v4 + Framer Motion + Lucide
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm">
              N
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">NexusChat</h4>
              <p className="text-xs text-zinc-500">Frontend Take-Home Assessment Deliverable</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400 font-medium">
            <Link href="/chat" className="hover:text-white transition">
              Live Chat App
            </Link>
            <Link href="/docs" className="hover:text-white transition">
              API Documentation
            </Link>
            <Link href="/login" className="hover:text-white transition">
              Test Personas
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
