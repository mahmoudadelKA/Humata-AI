import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

// DON'T DELETE THIS COMMENT
// Using blueprint:javascript_gemini integration
// The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL_NAME = "gemini-2.5-flash";

export interface GeminiChatOptions {
  systemPrompt?: string;
  fileData?: {
    base64: string;
    mimeType: string;
    fileName: string;
  };
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  options: GeminiChatOptions = {}
): Promise<string> {
  try {
    const contents: any[] = [];
    
    for (const msg of history) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    const userParts: any[] = [];
    
    // Add file as inline data if provided
    if (options.fileData) {
      console.log(`[Gemini] Adding file to request: ${options.fileData.fileName}, type: ${options.fileData.mimeType}`);
      userParts.push({
        inlineData: {
          data: options.fileData.base64,
          mimeType: options.fileData.mimeType,
        },
      });
    }
    
    userParts.push({ text: message });
    
    contents.push({
      role: "user",
      parts: userParts,
    });

    const config: any = {};
    
    if (options.systemPrompt) {
      config.systemInstruction = options.systemPrompt;
    }

    console.log(`[Gemini] Sending request with ${contents.length} messages, hasFile: ${!!options.fileData}`);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config,
    });

    console.log(`[Gemini] Response received successfully`);
    return response.text || "I apologize, but I couldn't generate a response.";
  } catch (error: any) {
    console.error("[Gemini] API error:", error);
    throw new Error(error.message || "Failed to generate response from AI");
  }
}

export async function processUploadedFile(
  filePath: string,
  mimeType: string,
  fileName: string
): Promise<{ base64: string; mimeType: string; fileName: string }> {
  try {
    console.log(`[Gemini] Processing file: ${fileName}, path: ${filePath}, type: ${mimeType}`);
    
    const fileBytes = fs.readFileSync(filePath);
    const base64Data = fileBytes.toString("base64");
    
    console.log(`[Gemini] File processed successfully, base64 length: ${base64Data.length}`);
    
    return {
      base64: base64Data,
      mimeType: mimeType,
      fileName: fileName,
    };
  } catch (error: any) {
    console.error("[Gemini] File processing error:", error);
    throw new Error(error.message || "Failed to process file");
  }
}

export async function analyzeImage(
  base64Data: string,
  mimeType: string,
  prompt: string = "Analyze this image in detail and describe its key elements, context, and any notable aspects."
): Promise<string> {
  try {
    const contents = [
      {
        inlineData: {
          data: base64Data,
          mimeType,
        },
      },
      prompt,
    ];

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
    });

    return response.text || "Unable to analyze the image.";
  } catch (error: any) {
    console.error("[Gemini] Image analysis error:", error);
    throw new Error(error.message || "Failed to analyze image");
  }
}
