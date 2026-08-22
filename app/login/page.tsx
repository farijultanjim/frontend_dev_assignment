'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Phone, User, ArrowRight, Loader2, Sparkles, Shield, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const DEMO_ACCOUNTS = [
  { name: 'Alex Johnson (Senior Lead)', phone: '+12345678901' },
  { name: 'Sarah Connor (Product)', phone: '+12345678902' },
  { name: 'Elena Rostova (Frontend)', phone: '+8801700000001' }
];

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/chat');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim() || !name.trim()) {
      setError('Please provide both your phone number and display name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(phone.trim(), name.trim());
      router.push('/chat');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demo: { name: string; phone: string }) => {
    setName(demo.name.split(' (')[0]);
    setPhone(demo.phone);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 py-12 text-zinc-50 selection:bg-indigo-500 selection:text-white">
      {/* Background glow ambient effects */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-violet-600/15 blur-[100px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <MessageSquare className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">NexusChat</span>
          </Link>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-zinc-100">
            Welcome to Real-Time Collaboration
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Sign in with your phone number. New accounts are registered automatically.
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/70 p-7 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +12345678901"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !phone.trim() || !name.trim()}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Continue to Chat</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">
              Quick Test Personas
            </span>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.phone}
                  type="button"
                  onClick={() => fillDemoAccount(demo)}
                  className="flex w-full items-center justify-between p-2 rounded-xl bg-zinc-950/40 border border-zinc-800/60 hover:border-indigo-500/40 hover:bg-indigo-950/20 text-left text-xs text-zinc-300 transition"
                >
                  <span className="font-medium truncate">{demo.name}</span>
                  <span className="text-[11px] font-mono text-zinc-500 shrink-0">{demo.phone}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back to Home / Docs */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300 transition">
            ← Back to Landing Page
          </Link>
          <span>•</span>
          <Link href="/docs" className="hover:text-zinc-300 transition">
            View API Docs →
          </Link>
        </div>
      </div>
    </div>
  );
}
