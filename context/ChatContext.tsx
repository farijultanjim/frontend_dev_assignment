'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Conversation, Message, SocketConnectionState } from '@/types/chat';
import { api } from '@/lib/api';
import { socketService } from '@/lib/socket';
import { soundManager } from '@/lib/utils';
import { useAuth } from './AuthContext';

interface ChatContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  hasMoreMessages: boolean;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isLoadingOlder: boolean;
  socketStatus: SocketConnectionState;
  setActiveConversation: (conversation: Conversation | null) => void;
  fetchConversations: () => Promise<void>;
  fetchOlderMessages: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  startDirectChat: (userId: string) => Promise<Conversation>;
  createGroupChat: (name: string, participantIds: string[]) => Promise<Conversation>;
  renameGroup: (conversationId: string, name: string) => Promise<void>;
  addGroupMembers: (conversationId: string, userIds: string[]) => Promise<void>;
  removeGroupMember: (conversationId: string, userId: string) => Promise<void>;
  promoteToAdmin: (conversationId: string, userId: string) => Promise<void>;
  leaveGroup: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({});
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [socketStatus, setSocketStatus] = useState<SocketConnectionState>('disconnected');

  const activeConvRef = useRef<Conversation | null>(null);
  activeConvRef.current = activeConversation;

  const currentUserId = user?._id;

  // Track socket connection state
  useEffect(() => {
    const unsub = socketService.onStateChange((state) => {
      setSocketStatus(state);
    });
    setSocketStatus(socketService.getState());
    return unsub;
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingConversations(true);
    try {
      const data = await api.getConversations();
      // Sort by updatedAt descending
      const sorted = [...data].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setConversations(sorted);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isAuthenticated]);

  // Load conversations on auth ready
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setConversations([]);
      setActiveConversationState(null);
      setMessagesMap({});
    }
  }, [isAuthenticated, fetchConversations]);

  // Fetch messages for a conversation
  const fetchMessagesForConv = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.getMessages(convId, 30);
      // Ensure messages are ordered chronologically (oldest to newest)
      const sorted = [...res.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: sorted
      }));
      setHasMoreMap((prev) => ({
        ...prev,
        [convId]: res.hasMore
      }));
    } catch (err) {
      console.error('Failed to fetch messages for conv:', convId, err);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const setActiveConversation = useCallback(
    (conv: Conversation | null) => {
      setActiveConversationState(conv);
      if (conv) {
        // Reset unread count for this conversation
        setConversations((prev) =>
          prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
        );
        fetchMessagesForConv(conv._id);
      }
    },
    [fetchMessagesForConv]
  );

  // Fetch older messages (cursor pagination)
  const fetchOlderMessages = async () => {
    if (!activeConversation) return;
    const convId = activeConversation._id;
    const currentMsgs = messagesMap[convId] || [];
    const hasMore = hasMoreMap[convId];

    if (!hasMore || isLoadingOlder || currentMsgs.length === 0) return;

    const oldestMessageId = currentMsgs[0]._id;
    setIsLoadingOlder(true);

    try {
      const res = await api.getMessages(convId, 30, oldestMessageId);
      const olderSorted = [...res.messages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      setMessagesMap((prev) => {
        const existing = prev[convId] || [];
        // De-duplicate by _id
        const existingIds = new Set(existing.map((m) => m._id));
        const newUnique = olderSorted.filter((m) => !existingIds.has(m._id));
        return {
          ...prev,
          [convId]: [...newUnique, ...existing]
        };
      });

      setHasMoreMap((prev) => ({
        ...prev,
        [convId]: res.hasMore
      }));
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setIsLoadingOlder(false);
    }
  };

  // Real-time message receiver
  useEffect(() => {
    const unsubMsg = socketService.onMessageNew((incomingMsg: Message) => {
      const convId = incomingMsg.conversation;
      const senderId =
        typeof incomingMsg.sender === 'object' ? incomingMsg.sender._id : incomingMsg.sender;
      const isFromMe = senderId === currentUserId;

      // Play sound
      if (!isFromMe) {
        soundManager.playReceived();
      }

      // 1. Update message list for the conversation
      setMessagesMap((prev) => {
        const currentList = prev[convId] || [];
        // Check if message already exists (e.g. optimistic match or duplicate socket dispatch)
        const exists = currentList.some(
          (m) =>
            m._id === incomingMsg._id ||
            (m.isOptimistic && m.text === incomingMsg.text && senderId === currentUserId)
        );

        if (exists) {
          return {
            ...prev,
            [convId]: currentList.map((m) =>
              m.isOptimistic && m.text === incomingMsg.text && senderId === currentUserId
                ? incomingMsg
                : m
            )
          };
        }

        return {
          ...prev,
          [convId]: [...currentList, incomingMsg]
        };
      });

      // 2. Update sidebar conversations (lastMessage & bump to top)
      setConversations((prev) => {
        const targetIndex = prev.findIndex((c) => c._id === convId);
        const isActive = activeConvRef.current?._id === convId;

        if (targetIndex === -1) {
          // New conversation received, trigger full refetch
          fetchConversations();
          return prev;
        }

        const target = prev[targetIndex];
        const updatedTarget: Conversation = {
          ...target,
          lastMessage: {
            _id: incomingMsg._id,
            text: incomingMsg.text,
            sender: incomingMsg.sender,
            createdAt: incomingMsg.createdAt
          },
          updatedAt: incomingMsg.createdAt,
          unreadCount: isActive || isFromMe ? 0 : (target.unreadCount || 0) + 1
        };

        const remaining = prev.filter((_, idx) => idx !== targetIndex);
        return [updatedTarget, ...remaining];
      });
    });

    // Real-time conversation update listener
    const unsubConv = socketService.onConversationUpdated((updatedConv: Conversation) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === updatedConv._id);
        if (idx === -1) {
          return [updatedConv, ...prev];
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updatedConv };
        return updated;
      });

      if (activeConvRef.current?._id === updatedConv._id) {
        setActiveConversationState((prev) => (prev ? { ...prev, ...updatedConv } : null));
      }
    });

    return () => {
      unsubMsg();
      unsubConv();
    };
  }, [currentUserId, fetchConversations]);

  // Send message with optimistic dispatch and REST/WebSocket fallback
  const sendMessage = async (text: string) => {
    if (!activeConversation || !text.trim() || !user) return;
    const convId = activeConversation._id;
    const tempId = `optimistic_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const optimisticMsg: Message = {
      _id: tempId,
      conversation: convId,
      sender: {
        _id: user._id,
        name: user.name,
        phone: user.phone
      },
      text: text.trim(),
      createdAt: timestamp,
      isOptimistic: true
    };

    // 1. Optimistic append
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimisticMsg]
    }));

    // Update conversation in sidebar
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c._id === convId);
      if (idx === -1) return prev;
      const target = {
        ...prev[idx],
        lastMessage: {
          text: text.trim(),
          sender: user._id,
          createdAt: timestamp
        },
        updatedAt: timestamp
      };
      const remaining = prev.filter((_, i) => i !== idx);
      return [target, ...remaining];
    });

    soundManager.playSent();

    // 2. Dispatch via REST (reliable delivery & guaranteed server persistence)
    try {
      const confirmedMsg = await api.sendMessage(convId, text.trim());

      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) => (m._id === tempId ? confirmedMsg : m))
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      // Mark as failed
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) =>
          m._id === tempId ? { ...m, isOptimistic: false, isFailed: true } : m
        )
      }));
      throw err;
    }
  };

  // Start direct chat
  const startDirectChat = async (targetUserId: string): Promise<Conversation> => {
    const newOrExisting = await api.startDirectConversation(targetUserId);
    await fetchConversations();
    // Locate in updated list or set directly
    setActiveConversation(newOrExisting);
    return newOrExisting;
  };

  // Create group chat
  const createGroupChat = async (name: string, participantIds: string[]): Promise<Conversation> => {
    const newGroup = await api.createGroup(name, participantIds);
    await fetchConversations();
    setActiveConversation(newGroup);
    return newGroup;
  };

  // Group management methods
  const renameGroup = async (conversationId: string, name: string) => {
    const updated = await api.renameGroup(conversationId, name);
    setConversations((prev) =>
      prev.map((c) => (c._id === conversationId ? { ...c, name: updated.name } : c))
    );
    if (activeConversation?._id === conversationId) {
      setActiveConversationState((prev) => (prev ? { ...prev, name: updated.name } : null));
    }
  };

  const addGroupMembers = async (conversationId: string, userIds: string[]) => {
    await api.addGroupParticipants(conversationId, userIds);
    await fetchConversations();
  };

  const removeGroupMember = async (conversationId: string, userId: string) => {
    await api.removeGroupParticipant(conversationId, userId);
    await fetchConversations();
  };

  const promoteToAdmin = async (conversationId: string, userId: string) => {
    await api.promoteAdmin(conversationId, userId);
    await fetchConversations();
  };

  const leaveGroup = async (conversationId: string) => {
    if (!user) return;
    await api.removeGroupParticipant(conversationId, user._id);
    if (activeConversation?._id === conversationId) {
      setActiveConversationState(null);
    }
    await fetchConversations();
  };

  const activeMessages = activeConversation ? messagesMap[activeConversation._id] || [] : [];
  const activeHasMore = activeConversation ? !!hasMoreMap[activeConversation._id] : false;

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages: activeMessages,
        hasMoreMessages: activeHasMore,
        isLoadingConversations,
        isLoadingMessages,
        isLoadingOlder,
        socketStatus,
        setActiveConversation,
        fetchConversations,
        fetchOlderMessages,
        sendMessage,
        startDirectChat,
        createGroupChat,
        renameGroup,
        addGroupMembers,
        removeGroupMember,
        promoteToAdmin,
        leaveGroup
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
