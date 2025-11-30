import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import fs from "fs";
import { storage } from "./storage";
import { sendChatMessage, uploadFileToGemini } from "./gemini";
import { randomUUID } from "crypto";
import { signupSchema, loginSchema, type SignupInput, type LoginInput, type User } from "@shared/schema";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const uploadDir = "/tmp/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Strict MIME type filter for Gemini Vision
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      console.log(`[Multer] Setting destination: ${uploadDir}`);
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${uniqueSuffix}-${file.originalname}`;
      console.log(`[Multer] Generated filename: ${filename}`);
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
  fileFilter: (req, file, cb) => {
    console.log(`[Multer] fileFilter called - filename: ${file.originalname}, mimetype: ${file.mimetype}, encoding: ${file.encoding}`);
    
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      console.log(`[Multer] MIME type accepted: ${file.mimetype}`);
      cb(null, true);
    } else {
      const errorMsg = `File type not supported. Received: ${file.mimetype}. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`;
      console.error(`[Multer] ${errorMsg}`);
      cb(new Error(errorMsg));
    }
  },
});

const hashPassword = (password: string): string => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-key";
const JWT_EXPIRY = "7d";

const generateJWT = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const validation = signupSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ success: false, error: validation.error.errors[0].message });
        return;
      }

      const { name, email, password } = validation.data;
      const existingUser = await storage.getUserByEmail(email);
      
      if (existingUser) {
        res.status(400).json({ success: false, error: "البريد الإلكتروني مستخدم بالفعل" });
        return;
      }

      const user: User = {
        id: randomUUID(),
        name,
        email,
        password: hashPassword(password),
        createdAt: new Date(),
      };

      await storage.createUser(user);
      const token = generateJWT(user.id);
      
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
      res.status(500).json({ success: false, error: "خطأ في التسجيل" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ success: false, error: validation.error.errors[0].message });
        return;
      }

      const { email, password } = validation.data;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== hashPassword(password)) {
        res.status(401).json({ success: false, error: "البريد أو كلمة المرور غير صحيحة" });
        return;
      }

      const token = generateJWT(user.id);
      
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
    } catch (error) {
      res.status(500).json({ success: false, error: "خطأ في تسجيل الدخول" });
    }
  });

  app.post("/api/auth/verify", async (req: Request, res: Response) => {
    try {
      const token = req.cookies.authToken;
      if (!token) {
        res.status(401).json({ success: false });
        return;
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await storage.getUserById(decoded.userId);
      if (!user) {
        res.status(401).json({ success: false });
        return;
      }

      res.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
      res.status(401).json({ success: false });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    res.clearCookie("authToken");
    res.json({ success: true });
  });
  
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, conversationId, persona, systemPrompt, base64Data, fileName, mimeType, enableGrounding } = req.body;
      const userId = (req as any).userId;

      console.log(`[Routes] Chat request - userId: ${userId}, message: "${message?.substring(0, 50)}...", hasFile: ${!!base64Data}, enableGrounding: ${enableGrounding}, persona: ${persona}`);

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      let currentConversationId = conversationId;
      let isFirstResponse = false;

      // Get conversation history
      let history: Array<{ role: string; content: string }> = [];
      if (currentConversationId) {
        const conversation = await storage.getConversation(currentConversationId);
        if (conversation) {
          history = conversation.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));
        }
      }

      let aiResponse: string;
      
      // Handle image search separately
      if (persona === "google-images") {
        // Search for images using Unsplash API
        const query = encodeURIComponent(message);
        const unsplashUrl = `https://api.unsplash.com/search/photos?query=${query}&count=9&client_id=qJV0vO-TIg_4-JrVgHaJ_6LbmN9sF7KDk-t0_RQYZWI`;
        
        try {
          const imageRes = await fetch(unsplashUrl);
          const imageData = await imageRes.json();
          
          if (imageData.results && imageData.results.length > 0) {
            // Format images data for display
            const images = imageData.results.map((img: any) => ({
              id: img.id,
              url: img.urls.regular,
              thumb: img.urls.thumb,
              alt: img.alt_description || "Image",
              downloadUrl: img.links.download_location,
              photographer: img.user.name
            }));
            
            aiResponse = JSON.stringify({
              type: "images",
              images: images,
              description: `تم العثور على ${images.length} صور متعلقة بـ "${message}"`
            });
          } else {
            aiResponse = `لم يتم العثور على صور متعلقة بـ "${message}". جرب كلمات بحث أخرى.`;
          }
        } catch (error) {
          aiResponse = `حدث خطأ في البحث عن الصور. يرجى المحاولة لاحقاً.`;
        }
      } else {
        aiResponse = await sendChatMessage(message, history, {
          systemPrompt: systemPrompt || undefined,
          base64Data: base64Data || undefined,
          mimeType: mimeType || undefined,
          fileName: fileName || undefined,
          enableGrounding: enableGrounding || false,
        });
      }

      const userMessage = {
        id: randomUUID(),
        role: "user" as const,
        content: message,
        timestamp: new Date(),
        fileInfo: base64Data ? { name: fileName || "file", type: mimeType || "unknown" } : undefined,
      };

      const assistantMessage = {
        id: randomUUID(),
        role: "assistant" as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      // Only save conversations for authenticated users, not for anonymous
      if (userId && userId !== "anonymous") {
        console.log(`[Routes] Saving conversation for userId: ${userId}`);
        
        if (!currentConversationId) {
          // Create new conversation on first AI response
          const firstUserMsg = message.substring(0, 50);
          console.log(`[Routes] Creating new conversation with title: ${firstUserMsg}`);
          const newConv = await storage.createConversation(userId, firstUserMsg);
          currentConversationId = newConv.id;
          isFirstResponse = true;
          console.log(`[Routes] New conversation created: ${currentConversationId}`);
        } else {
          // Verify conversation exists
          const existingConv = await storage.getConversation(currentConversationId);
          if (!existingConv) {
            console.log(`[Routes] Conversation not found, creating new one`);
            const firstUserMsg = message.substring(0, 50);
            const newConv = await storage.createConversation(userId, firstUserMsg);
            currentConversationId = newConv.id;
          }
        }
        
        console.log(`[Routes] Adding user message to conversation ${currentConversationId}`);
        await storage.addMessageToConversation(currentConversationId, userMessage);
        console.log(`[Routes] Adding assistant message to conversation ${currentConversationId}`);
        await storage.addMessageToConversation(currentConversationId, assistantMessage);
        console.log(`[Routes] Conversation saved successfully`);
      } else {
        console.log(`[Routes] Anonymous user - not saving conversation to database`);
      }

      console.log(`[Routes] Chat response sent successfully`);

      res.json({
        message: assistantMessage,
        conversationId: currentConversationId,
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

      console.log(`[Routes] Upload successful - fileName: ${uploadResult.fileName}`);

      res.json({
        success: true,
        base64Data: uploadResult.base64Data,
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

  // Conversations API
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const conversations = await storage.getConversations(userId);
      res.json(conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get a specific conversation by ID (works for both authenticated and unauthenticated sessions)
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      const { title } = req.body;
      const conversation = await storage.createConversation(userId, title || "New Conversation");
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await storage.updateConversation(req.params.id, title);
      if (!conversation) {
        res.status(404).json({ error: "Conversation not found" });
        return;
      }
      res.json(conversation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const deleted = await storage.deleteConversation(req.params.id);
      res.json({ success: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const { content, role } = req.body;
      const message = {
        id: randomUUID(),
        role: role as "user" | "assistant",
        content,
        timestamp: new Date(),
      };
      await storage.addMessageToConversation(req.params.id, message);
      res.json(message);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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
