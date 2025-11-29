import type { ChatMessage, ChatSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createSession(): Promise<ChatSession>;
  getSession(id: string): Promise<ChatSession | undefined>;
  addMessage(sessionId: string, message: ChatMessage): Promise<void>;
  getMessages(sessionId: string): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ChatSession>;

  constructor() {
    this.sessions = new Map();
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
}

export const storage = new MemStorage();
