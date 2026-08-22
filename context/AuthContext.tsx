'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@/types/chat';
import { api } from '@/lib/api';
import { socketService } from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, name: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    socketService.disconnect();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('chat_user_data');
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const currentToken = api.getToken();
      if (!currentToken) {
        setIsLoading(false);
        return;
      }
      const me = await api.getMe();
      setUser(me);
      setToken(currentToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_user_data', JSON.stringify(me));
      }
      socketService.connect(currentToken);
    } catch (err) {
      console.warn('Failed to restore session:', err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    // Initial session restore
    const savedToken = api.getToken();
    if (savedToken) {
      setToken(savedToken);
      const savedUserStr = localStorage.getItem('chat_user_data');
      if (savedUserStr) {
        try {
          setUser(JSON.parse(savedUserStr));
        } catch {}
      }
      refreshProfile();
    } else {
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [refreshProfile, logout]);

  const login = async (phone: string, name: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(phone, name);
      setUser(res.user);
      setToken(res.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('chat_user_data', JSON.stringify(res.user));
      }
      socketService.connect(res.token);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
