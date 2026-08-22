'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { SendHorizontal, Sparkles, CheckCheck, Users, Radio } from 'lucide-react';
import { formatMessageTime } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface DemoMessage {
  id: string;
  sender: string;
  name: string;
  text: string;
  time: string;
}

const INITIAL_DEMO_MESSAGES: DemoMessage[] = [
  {
    id: 'm1',
    sender: 'alex',
    name: 'Alex Johnson',
    text: 'Hey team! The real-time Socket.io engine and smart scroll hooks are ready for testing.',
    time: '2:45 PM'
  },
  {
    id: 'm2',
    sender: 'sarah',
    name: 'Sarah Connor',
    text: 'Testing cursor pagination — scrolling up preserves exact scroll anchor! Super smooth 🚀',
    time: '2:46 PM'
  },
  {
    id: 'm3',
    sender: 'alex',
    name: 'Alex Johnson',
    text: 'Try sending a message below to experience the optimistic delivery feedback!',
    time: '2:47 PM'
  }
];

export function InteractiveDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>(INITIAL_DEMO_MESSAGES);
  const [activePersona, setActivePersona] = useState<'alex' | 'sarah'>('alex');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: DemoMessage = {
      id: `demo_${Date.now()}`,
      sender: activePersona,
      name: activePersona === 'alex' ? 'Alex Johnson' : 'Sarah Connor',
      text: inputText.trim(),
      time: 'Just now'
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Trigger subtle celebratory confetti on first user message
    if (messages.length === INITIAL_DEMO_MESSAGES.length) {
      try {
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch {}
    }

    // Auto-respond simulation if Alex sent
    if (activePersona === 'alex') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `reply_${Date.now()}`,
            sender: 'sarah',
            name: 'Sarah Connor',
            text: `Got it! Verified realtime sync across both client channels ✨`,
            time: 'Just now'
          }
        ]);
      }, 1400);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="relative mx-auto w-full max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900/90 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* Top Demo Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3.5 bg-zinc-950/60">
        <div className="flex items-center gap-3">
          <Avatar name="Design & Engineering Hub" size="md" id="demo_hub" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Engineering Hub</h4>
              <Badge variant="primary" size="sm">
                <Users className="h-3 w-3" />
                <span>3 online</span>
              </Badge>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Interactive Live Preview</span>
            </p>
          </div>
        </div>

        {/* Persona Switcher */}
        <div className="flex items-center gap-1.5 rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
          <span className="text-[10px] text-zinc-500 px-1 font-semibold uppercase">Chatting as:</span>
          <button
            onClick={() => setActivePersona('alex')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activePersona === 'alex'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Alex
          </button>
          <button
            onClick={() => setActivePersona('sarah')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              activePersona === 'sarah'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sarah
          </button>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="h-72 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-950/40">
        {messages.map((msg) => {
          const isSelf = msg.sender === activePersona;
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
            >
              {!isSelf && <Avatar name={msg.name} size="sm" id={msg.sender} className="mb-0.5" />}
              <div
                className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                  isSelf
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-zinc-800 text-zinc-100 border border-zinc-700/60 rounded-bl-xs'
                }`}
              >
                {!isSelf && (
                  <span className="mb-0.5 block text-[10px] font-bold text-zinc-400">
                    {msg.name}
                  </span>
                )}
                <p className="leading-relaxed">{msg.text}</p>
                <div
                  className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                    isSelf ? 'text-indigo-200' : 'text-zinc-400'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isSelf && <CheckCheck className="h-2.5 w-2.5 text-indigo-200" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs italic">
            <Avatar name="Sarah Connor" size="sm" id="sarah" className="h-5 w-5 text-[9px]" />
            <span>Sarah is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Demo Input Box */}
      <form onSubmit={handleSend} className="border-t border-zinc-800 p-3 bg-zinc-950/80">
        <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 focus-within:border-indigo-500 transition">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Message as ${activePersona === 'alex' ? 'Alex' : 'Sarah'}...`}
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:opacity-40 hover:bg-indigo-500 transition"
          >
            <SendHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
