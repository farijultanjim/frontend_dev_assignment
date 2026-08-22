import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, isThisYear, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Consistent avatar background palette
const AVATAR_PALETTES = [
  { bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { bg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30' },
  { bg: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30' },
  { bg: 'bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border-fuchsia-500/30' },
  { bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  { bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  { bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30' },
  { bg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
];

export function getAvatarColor(idOrName: string) {
  if (!idOrName) return AVATAR_PALETTES[0].bg;
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = idOrName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index].bg;
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function formatMessageTime(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return format(date, 'h:mm a');
  } catch {
    return '';
  }
}

export function formatConversationTime(dateString?: string): string {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    if (isThisYear(date)) {
      return format(date, 'MMM d');
    }
    return format(date, 'MM/dd/yy');
  } catch {
    return '';
  }
}

export function formatDateSeparator(dateString: string): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (isNaN(date.getTime())) return '';

    if (isToday(date)) {
      return 'Today';
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    if (isThisYear(date)) {
      return format(date, 'EEEE, MMMM d');
    }
    return format(date, 'EEEE, MMMM d, yyyy');
  } catch {
    return '';
  }
}

export function truncate(str: string, length = 40): string {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

// Web Audio API Synthesizer for high-performance sound effects (zero network latency)
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('chat_sound_muted', muted ? 'true' : 'false');
    }
  }

  public getMuted(): boolean {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_sound_muted') === 'true';
    }
    return this.isMuted;
  }

  public playSent() {
    if (this.getMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playReceived() {
    if (this.getMuted()) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const soundManager = new SoundManager();
