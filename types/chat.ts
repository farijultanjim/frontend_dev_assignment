export interface User {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface DirectParticipant {
  _id: string;
  name: string;
  phone: string;
}

export interface GroupParticipant {
  _id: string;
  name: string;
  phone: string;
}

export interface LastMessage {
  _id?: string;
  text?: string;
  sender?: string | { _id: string; name?: string; phone?: string };
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: GroupParticipant[] | string[];
  participant?: DirectParticipant;
  lastMessage?: LastMessage;
  updatedAt?: string;
  createdAt?: string;
  unreadCount?: number;
}

export interface MessageSender {
  _id: string;
  name?: string;
  phone?: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: string | MessageSender;
  text: string;
  createdAt: string;
  isOptimistic?: boolean;
  isFailed?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UserSearchResponse {
  _id: string;
  name: string;
  phone: string;
}

export interface ConversationsListResponse {
  data: Conversation[];
}

export interface MessagesHistoryResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: any[];
  };
}

export type SocketConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
