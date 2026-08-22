import { useState, useCallback, useEffect } from 'react';
import { Conversation, User } from '@/types/chat';
import { api } from '@/lib/api';

export function useConversations(user: User | null, isAuthenticated: boolean) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversationState] = useState<Conversation | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingConversations(true);
    try {
      const data = await api.getConversations();
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

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    } else {
      setConversations([]);
      setActiveConversationState(null);
    }
  }, [isAuthenticated, fetchConversations]);

  const setActiveConversation = useCallback((conv: Conversation | null) => {
    setActiveConversationState(conv);
    if (conv) {
      setConversations((prev) =>
        prev.map((c) => (c._id === conv._id ? { ...c, unreadCount: 0 } : c))
      );
    }
  }, []);

  const startDirectChat = async (targetUserId: string): Promise<Conversation> => {
    const newOrExisting = await api.startDirectConversation(targetUserId);
    await fetchConversations();
    setActiveConversation(newOrExisting);
    return newOrExisting;
  };

  const createGroupChat = async (name: string, participantIds: string[]): Promise<Conversation> => {
    const newGroup = await api.createGroup(name, participantIds);
    await fetchConversations();
    setActiveConversation(newGroup);
    return newGroup;
  };

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

  return {
    conversations,
    setConversations,
    activeConversation,
    setActiveConversation,
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
  };
}
