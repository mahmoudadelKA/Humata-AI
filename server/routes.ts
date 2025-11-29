import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import fs from "fs";
import { storage } from "./storage";
import { sendChatMessage, uploadFileToGemini } from "./gemini";
import { randomUUID } from "crypto";

const uploadDir = "/tmp/uploads";
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

      console.log(`[Routes] Chat request - message: "${message?.substring(0, 50)}...", hasFile: ${!!fileUri}`);

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
        mimeType: mimeType || undefined,
        fileName: fileName || undefined,
      });

      const userMessage = {
        id: randomUUID(),
        role: "user" as const,
        content: message,
        timestamp: new Date(),
        fileInfo: fileUri ? { name: fileName || "file", type: mimeType || "unknown" } : undefined,
      };

      const assistantMessage = {
        id: randomUUID(),
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      await storage.addMessage(currentSessionId, userMessage);
      await storage.addMessage(currentSessionId, assistantMessage);

      console.log(`[Routes] Chat response sent successfully`);

      res.json({
        message: assistantMessage,
        sessionId: currentSessionId,
      });
    } catch (error: any) {
      console.error("[Routes] Chat error:", error);
      res.status(500).json({ 
        error: error.message || "Failed to process chat message" 
      });
    }
  });

  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      
      console.log(`[Routes] Upload request - file: ${file?.originalname || 'none'}`);
      
      if (!file) {
        console.error("[Routes] No file in upload request");
        res.status(400).json({ success: false, error: "No file uploaded" });
        return;
      }

      console.log(`[Routes] File metadata - path: ${file.path}, type: ${file.mimetype}, size: ${file.size}`);

      const uploadResult = await uploadFileToGemini(file.path, file.mimetype, file.originalname);

      fs.unlink(file.path, (err) => {
        if (err) console.error("[Routes] Failed to delete temp file:", err);
        else console.log(`[Routes] Temp file deleted: ${file.path}`);
      });

      console.log(`[Routes] Upload successful - fileUri: ${uploadResult.fileUri}`);

      res.json({
        success: true,
        fileUri: uploadResult.fileUri,
        fileName: uploadResult.fileName,
        mimeType: uploadResult.mimeType,
      });
    } catch (error: any) {
      console.error("[Routes] Upload error:", error);
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
