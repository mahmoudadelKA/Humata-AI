import { z } from "zod";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileInfo?: {
    name: string;
    type: string;
    uri?: string;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

export interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  glowColor: "cyan" | "magenta" | "purple";
}

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  sessionId: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const uploadFileSchema = z.object({
  prompt: z.string().optional(),
});

export type UploadFileInput = z.infer<typeof uploadFileSchema>;

export interface ChatResponse {
  message: ChatMessage;
  sessionId: string;
}

export interface UploadResponse {
  success: boolean;
  fileUri?: string;
  fileName?: string;
  mimeType?: string;
  error?: string;
}

export interface AnalyzeResponse {
  success: boolean;
  analysis?: string;
  error?: string;
}
