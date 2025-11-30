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
  
  // Image proxy endpoint to bypass hotlinking restrictions
  app.get("/api/proxy-image", async (req: Request, res: Response) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        res.status(400).json({ error: "Image URL parameter required" });
        return;
      }

      // Validate URL is valid
      let urlObj: URL;
      try {
        urlObj = new URL(imageUrl);
      } catch {
        res.status(400).json({ error: "Invalid URL" });
        return;
      }

      // Fetch the image
      const response = await fetch(imageUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000,
      });

      if (!response.ok) {
        res.status(response.status).json({ error: "Failed to fetch image" });
        return;
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.startsWith("image/")) {
        res.status(400).json({ error: "URL does not point to an image" });
        return;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400");
      
      const buffer = await response.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      console.error("Image proxy error:", error);
      res.status(500).json({ error: "Failed to proxy image" });
    }
  });
  
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
      const { message, conversationId, persona, systemPrompt, base64Data, fileName, mimeType, enableGrounding, guestId } = req.body;
      let userId = (req as any).userId;
      
      // Support guest users with unique guestId - NEVER use "anonymous"
      if (!userId) {
        if (guestId) {
          userId = guestId;
        } else {
          // Generate new unique guestId if not provided
          userId = randomUUID();
        }
        res.cookie("guestId", userId, { maxAge: 30 * 24 * 60 * 60 * 1000 });
      }

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

      // Check if user is asking "Who are you?" - respond directly without API call
      const whoAreYouPattern = /^[\s]*(من أنت|who are you|ما اسمك|what is your name|what's your name|من انت|ما هويتك)[\s]*[\?\.]?[\s]*$/i;
      if (whoAreYouPattern.test(message.trim())) {
        console.log(`[Routes] Detected "Who are you?" question - returning privacy-respecting response`);
        aiResponse = "أنا ذكاء اصطناعي تم تطويري من قبل محمود عادل. أنا هنا لمساعدتك في المحادثات والإجابة على أسئلتك بسرية وخصوصية تامة.";
      }
      
      // Handle image search with Wikimedia Commons API (free, no API key required)
      if (persona === "google-images") {
        try {
          const query = encodeURIComponent(message);
          // Using Wikimedia Commons API - completely free and reliable
          const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srsearch=${query}&srnamespace=6&srlimit=15&origin=*`;
          
          console.log(`[ImageSearch] Fetching images from Wikimedia Commons for query: ${message}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const imageRes = await fetch(wikiUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          const imageData = await imageRes.json();
          
          const searchResults = imageData.query?.search || [];
          console.log(`[ImageSearch] Found ${searchResults.length} results from Wikimedia`);
          
          if (searchResults.length > 0) {
            // Get file info for each result
            const fileNames = searchResults.slice(0, 15).map((r: any) => r.title);
            const fileInfoUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${fileNames.join("|")}&prop=imageinfo&iiprop=url&origin=*`;
            
            const fileRes = await fetch(fileInfoUrl);
            const fileData = await fileRes.json();
            
            const images: any[] = [];
            for (const page of Object.values(fileData.query?.pages || {})) {
              const page_data: any = page;
              if (page_data.imageinfo?.[0]?.url) {
                images.push({
                  url: page_data.imageinfo[0].url,
                  title: page_data.title || "صورة"
                });
              }
            }
            
            console.log(`[ImageSearch] Formatted ${images.length} valid image URLs`);
            aiResponse = images.length > 0 ? JSON.stringify(images) : `[]`;
          } else {
            console.log(`[ImageSearch] No results found on Wikimedia Commons`);
            aiResponse = `[]`;
          }
        } catch (error) {
          console.error("[ImageSearch] Error:", error);
          aiResponse = `[]`;
        }
      } else {
        const effectiveEnableGrounding = enableGrounding || (persona === "ask" || persona === "research");
        aiResponse = await sendChatMessage(message, history, {
          systemPrompt: systemPrompt || undefined,
          base64Data: base64Data || undefined,
          mimeType: mimeType || undefined,
          fileName: fileName || undefined,
          enableGrounding: effectiveEnableGrounding,
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

      // Save conversations for all users (including anonymous)
      const effectiveUserId = userId || "anonymous";
      console.log(`[Routes] Saving conversation for userId: ${effectiveUserId}`);
      
      // Ensure guest user exists in database before creating conversation
      try {
        const existingUser = await storage.getUserById(effectiveUserId);
        if (!existingUser) {
          console.log(`[Routes] Creating guest user: ${effectiveUserId}`);
          await storage.createUser({
            id: effectiveUserId,
            name: "Guest",
            email: `guest-${effectiveUserId}@anonymous.local`,
            password: "",
            createdAt: new Date(),
          });
        }
      } catch (userError) {
        console.warn(`[Routes] Warning creating user: ${userError}`);
      }
      
      if (!currentConversationId) {
        // Create new conversation on first AI response
        const firstUserMsg = message.substring(0, 50);
        console.log(`[Routes] Creating new conversation with title: ${firstUserMsg}`);
        const newConv = await storage.createConversation(effectiveUserId, firstUserMsg);
        currentConversationId = newConv.id;
        isFirstResponse = true;
        console.log(`[Routes] New conversation created: ${currentConversationId}`);
      } else {
        // Verify conversation exists
        const existingConv = await storage.getConversation(currentConversationId);
        if (!existingConv) {
          console.log(`[Routes] Conversation not found, creating new one`);
          const firstUserMsg = message.substring(0, 50);
          const newConv = await storage.createConversation(effectiveUserId, firstUserMsg);
          currentConversationId = newConv.id;
        }
      }
      
      console.log(`[Routes] Adding user message to conversation ${currentConversationId}`);
      await storage.addMessageToConversation(currentConversationId, userMessage);
      console.log(`[Routes] Adding assistant message to conversation ${currentConversationId}`);
      await storage.addMessageToConversation(currentConversationId, assistantMessage);
      console.log(`[Routes] Conversation saved successfully`);

      console.log(`[Routes] Chat response sent successfully`);

      res.json({
        message: assistantMessage,
        conversationId: currentConversationId,
      });
    } catch (error: any) {
      console.error("[Routes] Chat error - Full details:", {
        message: error.message,
        stack: error.stack,
        status: error.status,
        code: error.code,
        timestamp: new Date().toISOString()
      });
      
      // Handle specific API errors
      let errorMessage = "حدث خطأ في معالجة الرسالة";
      let statusCode = 500;
      
      // Check for API key errors
      if (error.message?.includes("API key") || error.message?.includes("apiKey")) {
        errorMessage = "خطأ في إعدادات الخادم - مفتاح API غير صحيح";
        statusCode = 500;
      }
      // Check for quota limit errors (429)
      else if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
        errorMessage = "تم تجاوز حد الطلبات المسموح. يرجى المحاولة لاحقاً.";
        statusCode = 429;
      } 
      // Check for other Gemini API errors
      else if (error.message?.includes("ApiError")) {
        errorMessage = "خطأ في الخدمة. يرجى المحاولة مرة أخرى.";
      }
      // Database errors
      else if (error.message?.includes("ECONNREFUSED") || error.message?.includes("database")) {
        errorMessage = "خطأ في الاتصال بقاعدة البيانات";
        statusCode = 503;
      }
      
      res.status(statusCode).json({ 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && { details: error.message })
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
      // Use guestId from cookies for anonymous users - NEVER use "anonymous"
      let userId = (req as any).userId || (req.cookies.guestId as string);
      
      if (!userId) {
        // Generate new guestId if user doesn't have one yet
        userId = randomUUID();
        res.cookie("guestId", userId, { maxAge: 30 * 24 * 60 * 60 * 1000 });
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
      let userId = (req as any).userId || (req.cookies.guestId as string);
      if (!userId) {
        userId = randomUUID();
        res.cookie("guestId", userId, { maxAge: 30 * 24 * 60 * 60 * 1000 });
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
