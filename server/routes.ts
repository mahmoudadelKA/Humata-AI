import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { sendChatMessage, uploadFileToGemini } from "./gemini";
import { sendMessageSchema } from "@shared/schema";
import { randomUUID } from "crypto";

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images and PDFs are allowed."));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, sessionId, persona, systemPrompt, fileUri, fileName, mimeType } = req.body;

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const session = await storage.createSession();
        currentSessionId = session.id;
      }

      const existingMessages = await storage.getMessages(currentSessionId);
      const history = existingMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await sendChatMessage(message, history, {
        systemPrompt: systemPrompt || undefined,
        fileUri: fileUri || undefined,
        fileName: fileName || undefined,
        mimeType: mimeType || undefined,
      });

      const userMessage = {
        id: randomUUID(),
        role: "user" as const,
        content: message,
        timestamp: new Date(),
        fileInfo: fileUri ? { name: fileName || "file", type: mimeType || "unknown", uri: fileUri } : undefined,
      };

      const assistantMessage = {
        id: randomUUID(),
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      await storage.addMessage(currentSessionId, userMessage);
      await storage.addMessage(currentSessionId, assistantMessage);

      res.json({
        message: assistantMessage,
        sessionId: currentSessionId,
      });
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process chat message" 
      });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      const filePath = file.path;
      const mimeType = file.mimetype;
      const displayName = file.originalname;

      const uploadResult = await uploadFileToGemini(filePath, mimeType, displayName);

      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });

      res.json({
        success: true,
        fileUri: uploadResult.uri,
        fileName: displayName,
        mimeType: mimeType,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false, 
        error: error.message || "Failed to upload file" 
      });
    }
  });

  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ 
      status: "online", 
      timestamp: new Date().toISOString(),
      model: "gemini-2.5-flash",
    });
  });

  return httpServer;
}
