import type { ChatMessage, ChatSession, User, Conversation } from "@shared/schema";
import { randomUUID } from "crypto";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("ssl") ? { rejectUnauthorized: false } : false,
});

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

export class DbStorage implements IStorage {
  async createSession(): Promise<ChatSession> {
    const session: ChatSession = {
      id: randomUUID(),
      messages: [],
      createdAt: new Date(),
    };
    return session;
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    return undefined;
  }

  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
  }

  async getMessages(sessionId: string): Promise<ChatMessage[]> {
    return [];
  }

  async createUser(user: User): Promise<User> {
    try {
      const query = `
        INSERT INTO users (id, name, email, password, created_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO NOTHING
        RETURNING *
      `;
      const result = await pool.query(query, [
        user.id,
        user.name,
        user.email,
        user.password,
        user.createdAt,
      ]);
      return result.rows[0] || user;
    } catch (error) {
      console.error("[DbStorage] Error creating user:", error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await pool.query(query, [email]);
      if (result.rows.length === 0) return undefined;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("[DbStorage] Error getting user by email:", error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const query = `SELECT * FROM users WHERE id = $1`;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return undefined;
      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error("[DbStorage] Error getting user by id:", error);
      throw error;
    }
  }

  async createConversation(userId: string, title: string): Promise<Conversation> {
    try {
      // No need to create user for anonymous guests - just save conversation with guest_id
      const conversationId = randomUUID();
      const shareToken = randomUUID();
      const now = new Date();
      const query = `
        INSERT INTO conversations (id, user_id, title, created_at, updated_at, share_token)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      const result = await pool.query(query, [
        conversationId,
        userId,
        title,
        now,
        now,
        shareToken,
      ]);
      const row = result.rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        messages: [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        shareToken: row.share_token,
      };
    } catch (error) {
      console.error("[DbStorage] Error creating conversation:", error);
      throw error;
    }
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const query = `SELECT * FROM conversations WHERE user_id = $1 ORDER BY updated_at DESC`;
      const result = await pool.query(query, [userId]);
      return Promise.all(
        result.rows.map(async (row) => {
          const messagesResult = await pool.query(
            `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
            [row.id]
          );
          return {
            id: row.id,
            userId: row.user_id,
            title: row.title,
            messages: messagesResult.rows.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.created_at,
              fileInfo: msg.file_info,
            })),
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            shareToken: row.share_token,
          };
        })
      );
    } catch (error) {
      console.error("[DbStorage] Error getting conversations:", error);
      throw error;
    }
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    try {
      const query = `SELECT * FROM conversations WHERE id = $1`;
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return undefined;
      const row = result.rows[0];

      const messagesResult = await pool.query(
        `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
        [id]
      );

      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        messages: messagesResult.rows.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          fileInfo: msg.file_info,
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        shareToken: row.share_token,
      };
    } catch (error) {
      console.error("[DbStorage] Error getting conversation:", error);
      throw error;
    }
  }

  async updateConversation(id: string, title: string): Promise<Conversation | undefined> {
    try {
      const now = new Date();
      const query = `
        UPDATE conversations SET title = $1, updated_at = $2 WHERE id = $3
        RETURNING *
      `;
      const result = await pool.query(query, [title, now, id]);
      if (result.rows.length === 0) return undefined;
      const row = result.rows[0];

      const messagesResult = await pool.query(
        `SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
        [id]
      );

      return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        messages: messagesResult.rows.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at,
          fileInfo: msg.file_info,
        })),
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        shareToken: row.share_token,
      };
    } catch (error) {
      console.error("[DbStorage] Error updating conversation:", error);
      throw error;
    }
  }

  async deleteConversation(id: string): Promise<boolean> {
    try {
      await pool.query(`DELETE FROM messages WHERE conversation_id = $1`, [id]);
      const result = await pool.query(`DELETE FROM conversations WHERE id = $1`, [id]);
      return result.rowCount! > 0;
    } catch (error) {
      console.error("[DbStorage] Error deleting conversation:", error);
      throw error;
    }
  }

  async addMessageToConversation(conversationId: string, message: ChatMessage): Promise<void> {
    try {
      const query = `
        INSERT INTO messages (id, conversation_id, role, content, file_info, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await pool.query(query, [
        message.id,
        conversationId,
        message.role,
        message.content,
        message.fileInfo ? JSON.stringify(message.fileInfo) : null,
        message.timestamp,
      ]);

      await pool.query(
        `UPDATE conversations SET updated_at = $1 WHERE id = $2`,
        [new Date(), conversationId]
      );
    } catch (error) {
      console.error("[DbStorage] Error adding message to conversation:", error);
      throw error;
    }
  }
}

export const storage = new DbStorage();
