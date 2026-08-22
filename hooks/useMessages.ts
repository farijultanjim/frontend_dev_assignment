import { useState, useCallback } from 'react';
import { Message, Conversation, User } from '@/types/chat';
import { api } from '@/lib/api';
import { soundManager } from '@/lib/utils';

export function useMessages(
  user: User | null,
  activeConversation: Conversation | null,
  onMessageSentSuccess?: (convId: string, timestamp: string, text: string) => void
) {
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({});
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const fetchMessagesForConv = useCallback(async (convId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.getMessages(convId, 30);
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

    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimisticMsg]
    }));

    if (onMessageSentSuccess) {
      onMessageSentSuccess(convId, timestamp, text.trim());
    }

    soundManager.playSent();

    try {
      const confirmedMsg = await api.sendMessage(convId, text.trim());
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) => (m._id === tempId ? confirmedMsg : m))
      }));
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessagesMap((prev) => ({
        ...prev,
        [convId]: (prev[convId] || []).map((m) =>
          m._id === tempId ? { ...m, isOptimistic: false, isFailed: true } : m
        )
      }));
      throw err;
    }
  };

  return {
    messagesMap,
    setMessagesMap,
    hasMoreMap,
    isLoadingMessages,
    isLoadingOlder,
    fetchMessagesForConv,
    fetchOlderMessages,
    sendMessage
  };
}
