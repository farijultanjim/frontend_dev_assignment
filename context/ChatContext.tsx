'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { Conversation, Message, SocketConnectionState } from '@/types/chat';
import { soundManager } from '@/lib/utils';
import { useAuth } from './AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useChatSocket } from '@/hooks/useChatSocket';

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
  const currentUserId = user?._id;

  // 1. Conversations Hook
  const {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation: setBaseActiveConversation,
    setActiveConversationState,
    isLoadingConversations,
    fetchConversations,
    startDirectChat,
    createGroupChat,
    renameGroup,
    addGroupMembers,
    removeGroupMember,
    promoteToAdmin,
    leaveGroup
  } = useConversations(user, isAuthenticated);

  const activeConvRef = useRef<Conversation | null>(null);
  activeConvRef.current = activeConversation;

  // 2. Messages Hook
  const onOptimisticSent = (convId: string, timestamp: string, text: string) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c._id === convId);
      if (idx === -1) return prev;
      const target = {
        ...prev[idx],
        lastMessage: { text, sender: currentUserId, createdAt: timestamp },
        updatedAt: timestamp
      };
      const remaining = prev.filter((_, i) => i !== idx);
      return [target, ...remaining];
    });
  };

  const {
    messagesMap,
    setMessagesMap,
    hasMoreMap,
    isLoadingMessages,
    isLoadingOlder,
    fetchMessagesForConv,
    fetchOlderMessages,
    sendMessage
  } = useMessages(user, activeConversation, onOptimisticSent);

  const setActiveConversation = useCallback(
    (conv: Conversation | null) => {
      setBaseActiveConversation(conv);
      if (conv) {
        fetchMessagesForConv(conv._id);
      }
    },
    [setBaseActiveConversation, fetchMessagesForConv]
  );

  // 3. Real-Time Socket Hook
  const handleIncomingMessage = useCallback(
    (incomingMsg: Message) => {
      const convId = incomingMsg.conversation;
      const senderId =
        typeof incomingMsg.sender === 'object' ? incomingMsg.sender._id : incomingMsg.sender;
      const isFromMe = senderId === currentUserId;

      if (!isFromMe) {
        soundManager.playReceived();
      }

      setMessagesMap((prev) => {
        const currentList = prev[convId] || [];
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

      setConversations((prev) => {
        const targetIndex = prev.findIndex((c) => c._id === convId);
        const isActive = activeConvRef.current?._id === convId;

        if (targetIndex === -1) {
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
    },
    [currentUserId, fetchConversations, setMessagesMap, setConversations]
  );

  const handleConversationUpdated = useCallback(
    (updatedConv: Conversation) => {
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === updatedConv._id);
        if (idx === -1) return [updatedConv, ...prev];
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updatedConv };
        return updated;
      });

      if (activeConvRef.current?._id === updatedConv._id) {
        setActiveConversationState((prev) => (prev ? { ...prev, ...updatedConv } : null));
      }
    },
    [setConversations, setActiveConversationState]
  );

  const { socketStatus } = useChatSocket({
    onMessageNew: handleIncomingMessage,
    onConversationUpdated: handleConversationUpdated
  });

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
