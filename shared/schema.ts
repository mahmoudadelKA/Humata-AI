import { z } from "zod";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export interface AuthResponse {
  success: boolean;
  user?: { id: string; name: string; email: string };
  error?: string;
  token?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileInfo?: {
    name: string;
    type: string;
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
  glowColor: "cyan" | "magenta" | "purple" | "green" | "yellow";
  position?: "top-left" | "top-center" | "top-right" | "middle-left" | "middle-right" | "bottom-left" | "bottom-center" | "bottom-right";
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
