import { useState, useEffect } from 'react';
import { socketService } from '@/lib/socket';
import { SocketConnectionState, Message, Conversation } from '@/types/chat';

interface UseChatSocketProps {
  onMessageNew: (message: Message) => void;
  onConversationUpdated: (conversation: Conversation) => void;
}

export function useChatSocket({ onMessageNew, onConversationUpdated }: UseChatSocketProps) {
  const [socketStatus, setSocketStatus] = useState<SocketConnectionState>('disconnected');

  useEffect(() => {
    const unsubState = socketService.onStateChange((state) => {
      setSocketStatus(state);
    });
    setSocketStatus(socketService.getState());

    const unsubMsg = socketService.onMessageNew(onMessageNew);
    const unsubConv = socketService.onConversationUpdated(onConversationUpdated);

    return () => {
      unsubState();
      unsubMsg();
      unsubConv();
    };
  }, [onMessageNew, onConversationUpdated]);

  return { socketStatus };
}
