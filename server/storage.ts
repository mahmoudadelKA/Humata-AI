import type { ChatMessage, ChatSession, User } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(): Promise<ChatSession>;
  getSession(id: string): Promise<ChatSession | undefined>;
  addMessage(sessionId: string, message: ChatMessage): Promise<void>;
  getMessages(sessionId: string): Promise<ChatMessage[]>;
  createUser(user: User): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ChatSession>;
  private users: Map<string, User>;

  constructor() {
    this.sessions = new Map();
    this.users = new Map();
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
}

export const storage = new MemStorage();
