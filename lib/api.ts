import {
  User,
  Conversation,
  Message,
  LoginResponse,
  UserSearchResponse,
  ConversationsListResponse,
  MessagesHistoryResponse,
  ApiErrorResponse
} from '@/types/chat';

export const API_BASE_URL = 'https://frontend-task-chatapp.onrender.com/api';
export const ROOT_URL = 'https://frontend-task-chatapp.onrender.com';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('chat_jwt_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('chat_jwt_token', token);
      } else {
        localStorage.removeItem('chat_jwt_token');
      }
    }
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('chat_jwt_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorData = data as ApiErrorResponse;
        const message = errorData?.error?.message || response.statusText || 'An unexpected API error occurred';
        const code = errorData?.error?.code || `HTTP_${response.status}`;
        const error = new Error(message) as Error & { code?: string; status?: number; details?: any[] };
        error.code = code;
        error.status = response.status;
        error.details = errorData?.error?.details;
        throw error;
      }

      return data as T;
    } catch (err: any) {
      if (err.status === 401 && typeof window !== 'undefined') {
        // Broadcast unauthorized session expiration if on browser
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw err;
    }
  }

  // --- Auth Endpoints ---
  public async login(phone: string, name: string): Promise<LoginResponse> {
    const data = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone: phone.trim(), name: name.trim() })
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  public async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // --- User Search ---
  public async searchUsers(query: string): Promise<UserSearchResponse[]> {
    if (!query || !query.trim()) return [];
    return this.request<UserSearchResponse[]>(`/users/search?q=${encodeURIComponent(query.trim())}`);
  }

  // --- Conversations ---
  public async getConversations(): Promise<Conversation[]> {
    const res = await this.request<ConversationsListResponse>('/conversations');
    return res.data || [];
  }

  public async startDirectConversation(userId: string): Promise<Conversation> {
    return this.request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  public async createGroup(name: string, participantIds: string[]): Promise<Conversation> {
    return this.request<Conversation>('/conversations/group', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        participantIds
      })
    });
  }

  public async renameGroup(conversationId: string, name: string): Promise<Conversation> {
    return this.request<Conversation>(`/conversations/${conversationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: name.trim() })
    });
  }

  public async addGroupParticipants(conversationId: string, userIds: string[]): Promise<any> {
    return this.request<any>(`/conversations/${conversationId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userIds })
    });
  }

  public async removeGroupParticipant(conversationId: string, userId: string): Promise<any> {
    return this.request<any>(`/conversations/${conversationId}/participants/${userId}`, {
      method: 'DELETE'
    });
  }

  public async promoteAdmin(conversationId: string, userId: string): Promise<any> {
    return this.request<any>(`/conversations/${conversationId}/admins`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  // --- Messages ---
  public async getMessages(conversationId: string, limit = 30, before?: string): Promise<MessagesHistoryResponse> {
    let url = `/conversations/${conversationId}/messages?limit=${limit}`;
    if (before) {
      url += `&before=${encodeURIComponent(before)}`;
    }
    return this.request<MessagesHistoryResponse>(url);
  }

  public async sendMessage(conversationId: string, text: string): Promise<Message> {
    return this.request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({
        conversationId,
        text: text.trim()
      })
    });
  }

  // --- Health ---
  public async checkHealth(): Promise<{ status: string }> {
    // Health is served at root /health
    return this.request<{ status: string }>(`${ROOT_URL}/health`);
  }
}

export const api = new ApiClient();
