import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

// DON'T DELETE THIS COMMENT
// Using blueprint:javascript_gemini integration
// The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

// API Key Rotation System - supports multiple keys
class ApiKeyManager {
  private keys: string[] = [];
  private currentIndex: number = 0;
  private failedKeys: Set<string> = new Set();
  private lastResetTime: number = Date.now();

  constructor() {
    this.loadKeys();
  }

  private loadKeys() {
    // Load keys from environment - supports GEMINI_API_KEY, GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
    const mainKey = process.env.GEMINI_API_KEY;
    if (mainKey) {
      this.keys.push(mainKey);
    }

    // Load numbered keys (1-50)
    for (let i = 1; i <= 50; i++) {
      const key = process.env[`GEMINI_API_KEY_${i}`];
      if (key) {
        this.keys.push(key);
      }
    }

    if (this.keys.length === 0) {
      console.error("[Gemini] CRITICAL: No GEMINI_API_KEY environment variables are set!");
    } else {
      console.log(`[Gemini] Loaded ${this.keys.length} API key(s)`);
    }
  }

  getCurrentKey(): string {
    // Reset failed keys every 24 hours (daily quota reset)
    const now = Date.now();
    if (now - this.lastResetTime > 24 * 60 * 60 * 1000) {
      console.log("[Gemini] Resetting failed keys (24h passed)");
      this.failedKeys.clear();
      this.lastResetTime = now;
    }

    if (this.keys.length === 0) {
      return "";
    }

    // Find next available key
    let attempts = 0;
    while (attempts < this.keys.length) {
      const key = this.keys[this.currentIndex];
      if (!this.failedKeys.has(key)) {
        return key;
      }
      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    // All keys failed, try first key anyway
    console.warn("[Gemini] All keys exhausted, retrying from first key");
    return this.keys[0];
  }

  markKeyFailed(key: string) {
    this.failedKeys.add(key);
    console.log(`[Gemini] Key marked as failed. ${this.keys.length - this.failedKeys.size} keys remaining`);
    this.rotateToNextKey();
  }

  rotateToNextKey() {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    console.log(`[Gemini] Rotated to key index: ${this.currentIndex}`);
  }

  getKeyCount(): number {
    return this.keys.length;
  }

  getAvailableKeysCount(): number {
    return this.keys.length - this.failedKeys.size;
  }

  getKeyStatus(): { total: number; available: number; failed: number } {
    return {
      total: this.keys.length,
      available: this.keys.length - this.failedKeys.size,
      failed: this.failedKeys.size
    };
  }
}

const keyManager = new ApiKeyManager();

const MODEL_NAME = "gemini-2.5-pro";

export interface GeminiChatOptions {
  systemPrompt?: string;
  base64Data?: string;
  mimeType?: string;
  fileName?: string;
  enableGrounding?: boolean;
  files?: Array<{ base64Data: string; mimeType: string; fileName: string }>;
}

export function getApiKeyStatus() {
  return keyManager.getKeyStatus();
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  options: GeminiChatOptions = {}
): Promise<string> {
  const maxRetries = Math.min(keyManager.getKeyCount(), 5);
  let lastError: any = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentKey = keyManager.getCurrentKey();
    
    if (!currentKey) {
      throw new Error("لا يوجد مفتاح API متاح");
    }

    const ai = new GoogleGenAI({ apiKey: currentKey });

    try {
      const contents: any[] = [];

      // Add message history
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }

      // Build user message with optional file reference
      const userParts: any[] = [];

      // Add multiple files support
      if (options.files && options.files.length > 0) {
        for (const file of options.files) {
          console.log(
            `[Gemini] Adding file - type: ${file.mimeType}, fileName: ${file.fileName}`
          );
          userParts.push({
            inlineData: {
              mimeType: file.mimeType,
              data: file.base64Data,
            },
          });
        }
      }
      // Backward compatibility - single file
      else if (options.base64Data && options.mimeType) {
        console.log(
          `[Gemini] Adding inline file data - type: ${options.mimeType}, fileName: ${options.fileName}`
        );
        userParts.push({
          inlineData: {
            mimeType: options.mimeType,
            data: options.base64Data,
          },
        });
      }

      // Add the user's text message
      userParts.push({ text: message });

      contents.push({
        role: "user",
        parts: userParts,
      });

      const config: any = {};

      // Build system instruction with technical transparency override and output cleanliness
      const technicalTransparencyInstruction = `You are an AI assistant that is fully transparent about its technical specifications. If the user asks for your specific model name, model ID, or what model you are running (e.g., 'What is your model ID?', 'What model are you?', 'What's your name?'), you MUST respond with your exact current model ID: "${MODEL_NAME}". Do not evade the question with generic responses like 'I am a large language model...' - be direct and provide the exact model identifier.

CRITICAL OUTPUT REQUIREMENT: Your responses MUST be clean, readable, professional prose. AVOID using any decorative Markdown characters like asterisks (*), hashtags (#), backticks (\`), or excessive formatting symbols. Focus on clear, clean text only. Use simple line breaks for paragraph separation instead of Markdown formatting.`;

      let finalSystemInstruction = technicalTransparencyInstruction;
      
      if (options.systemPrompt) {
        // Prepend technical transparency instruction to ensure it takes priority
        finalSystemInstruction = `${technicalTransparencyInstruction}\n\n${options.systemPrompt}`;
      }

      config.systemInstruction = finalSystemInstruction;

      // Add grounding/web search capability when enabled
      if (options.enableGrounding) {
        console.log(`[Gemini] Enabling web search for this query`);
        config.tools = [
          {
            googleSearch: {}
          }
        ];
      }

      console.log(
        `[Gemini] Sending generateContent - items: ${contents.length}, hasFiles: ${!!(options.files?.length || options.base64Data)}, modelId: ${MODEL_NAME}, enableGrounding: ${options.enableGrounding}, attempt: ${attempt + 1}/${maxRetries}`
      );

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents,
        config,
      });

      console.log(`[Gemini] Response received successfully`);
      return response.text || "I apologize, but I couldn't generate a response.";
    } catch (error: any) {
      console.error(`[Gemini] API error (attempt ${attempt + 1}):`, {
        message: error.message,
        status: error.status,
        code: error.code,
      });
      
      lastError = error;

      // Check if it's a quota/rate limit error - rotate to next key
      if (error.status === 429 || error.message?.includes("quota") || error.message?.includes("429")) {
        console.log(`[Gemini] Quota exceeded on current key, rotating...`);
        keyManager.markKeyFailed(currentKey);
        continue; // Try next key
      }
      
      // For other errors, don't rotate
      break;
    }
  }

  // All retries failed
  console.error("[Gemini] All retry attempts failed:", {
    message: lastError?.message,
    status: lastError?.status,
    code: lastError?.code,
    fullError: JSON.stringify(lastError)
  });
  
  // Check for specific errors
  if (lastError?.message?.includes("API key")) {
    throw new Error("خطأ في مفتاح API - تحقق من إعدادات الخادم");
  }
  if (lastError?.status === 429 || lastError?.message?.includes("quota")) {
    throw new Error("تم تجاوز حد الاستخدام على جميع المفاتيح. يرجى إضافة مفاتيح جديدة أو المحاولة لاحقاً.");
  }
  
  throw new Error(lastError?.message || "Failed to generate response from AI");
}

export async function uploadFileToGemini(
  filePath: string,
  mimeType: string,
  fileName: string
): Promise<{ base64Data: string; mimeType: string; fileName: string }> {
  try {
    console.log(
      `[Gemini] uploadFileToGemini called - file: ${fileName}, mimeType: ${mimeType}`
    );
    console.log(`[Gemini] File path: ${filePath}`);

    // Read file as Buffer
    const fileBytes = fs.readFileSync(filePath);
    console.log(
      `[Gemini] File read successfully - size: ${fileBytes.length} bytes`
    );

    // Convert to base64
    const base64Data = fileBytes.toString("base64");
    console.log(
      `[Gemini] File converted to base64 - length: ${base64Data.length}`
    );

    return {
      base64Data,
      mimeType,
      fileName,
    };
  } catch (error: any) {
    console.error("[Gemini] File upload error:", error);
    console.error("[Gemini] Error stack:", error.stack);
    throw new Error(error.message || "Failed to process file");
  }
}
