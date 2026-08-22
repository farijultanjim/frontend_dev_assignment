import { io, Socket } from 'socket.io-client';
import { ROOT_URL } from '@/lib/api';
import { Message, Conversation, SocketConnectionState } from '@/types/chat';

type MessageNewHandler = (message: Message) => void;
type ConversationUpdatedHandler = (conversation: Conversation) => void;
type StateChangeHandler = (state: SocketConnectionState) => void;

class SocketService {
  private socket: Socket | null = null;
  private state: SocketConnectionState = 'disconnected';
  private messageNewListeners: Set<MessageNewHandler> = new Set();
  private conversationUpdatedListeners: Set<ConversationUpdatedHandler> = new Set();
  private stateChangeListeners: Set<StateChangeHandler> = new Set();

  public getState(): SocketConnectionState {
    return this.state;
  }

  private setState(newState: SocketConnectionState) {
    if (this.state !== newState) {
      this.state = newState;
      this.stateChangeListeners.forEach(fn => fn(newState));
    }
  }

  public connect(token: string) {
    if (this.socket && this.socket.connected) {
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.setState('connecting');

    this.socket = io(ROOT_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000
    });

    this.socket.on('connect', () => {
      this.setState('connected');
    });

    this.socket.on('disconnect', (reason) => {
      this.setState('disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      this.setState('error');
    });

    // Server-to-Client Events
    this.socket.on('message:new', (data: Message) => {
      this.messageNewListeners.forEach(fn => fn(data));
    });

    this.socket.on('conversation:updated', (data: Conversation) => {
      this.conversationUpdatedListeners.forEach(fn => fn(data));
    });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setState('disconnected');
    }
  }

  public sendMessage(conversationId: string, text: string): Promise<Message> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      // Socket.io client message:send event
      this.socket.emit('message:send', { conversationId, text }, (response: any) => {
        if (response && response.error) {
          reject(new Error(response.error.message || 'Failed to send message over socket'));
        } else {
          resolve(response as Message);
        }
      });

      // Fallback timeout in case ack is not enabled on backend server
      setTimeout(() => {
        // If ack didn't fire in 3s, resolve optimistic
        resolve({
          _id: `socket_${Date.now()}`,
          conversation: conversationId,
          sender: '',
          text,
          createdAt: new Date().toISOString()
        });
      }, 3000);
    });
  }

  // Listener subscriptions
  public onMessageNew(handler: MessageNewHandler): () => void {
    this.messageNewListeners.add(handler);
    return () => this.messageNewListeners.delete(handler);
  }

  public onConversationUpdated(handler: ConversationUpdatedHandler): () => void {
    this.conversationUpdatedListeners.add(handler);
    return () => this.conversationUpdatedListeners.delete(handler);
  }

  public onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeListeners.add(handler);
    return () => this.stateChangeListeners.delete(handler);
  }
}

export const socketService = new SocketService();
