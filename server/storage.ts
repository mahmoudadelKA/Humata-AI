import type { ChatMessage, ChatSession, User, Conversation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(): Promise<ChatSession>;
  getSession(id: string): Promise<ChatSession | undefined>;
  addMessage(sessionId: string, message: ChatMessage): Promise<void>;
  getMessages(sessionId: string): Promise<ChatMessage[]>;
  createUser(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  createConversation(userId: string, title: string): Promise<Conversation>;
  getConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  updateConversation(id: string, title: string): Promise<Conversation | undefined>;
  deleteConversation(id: string): Promise<boolean>;
  addMessageToConversation(conversationId: string, message: ChatMessage): Promise<void>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ChatSession>;
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.sessions = new Map();
    this.users = new Map();
    this.conversations = new Map();
  }

  async createSession(): Promise<ChatSession> {
    const session: ChatSession = {
      id: randomUUID(),
      messages: [],
      createdAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    return this.sessions.get(id);
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push(message);
    }
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const session = this.sessions.get(sessionId);
    return session?.messages || [];
  }

  async createUser(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: randomUUID(),
      userId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      shareToken: randomUUID(),
    };
    this.conversations.set(conversation.id, conversation);
    return conversation;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(c => c.userId === userId);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async updateConversation(id: string, title: string): Promise<Conversation | undefined> {
    const conv = this.conversations.get(id);
    if (conv) {
      conv.title = title;
      conv.updatedAt = new Date();
      return conv;
    }
    return undefined;
  }

  async deleteConversation(id: string): Promise<boolean> {
    return this.conversations.delete(id);
  }

  async addMessageToConversation(conversationId: string, message: ChatMessage): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.messages.push(message);
      conversation.updatedAt = new Date();
    }
  }
}

export const storage = new MemStorage();
