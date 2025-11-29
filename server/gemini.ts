import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

// DON'T DELETE THIS COMMENT
// Using blueprint:javascript_gemini integration
// The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL_NAME = "gemini-2.5-flash";

export interface GeminiChatOptions {
  systemPrompt?: string;
  base64Data?: string;
  mimeType?: string;
  fileName?: string;
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }> = [],
  options: GeminiChatOptions = {}
): Promise<string> {
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

    // Add file data as inline data if base64 is provided
    if (options.base64Data && options.mimeType) {
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

    if (options.systemPrompt) {
      config.systemInstruction = options.systemPrompt;
    }

    console.log(
      `[Gemini] Sending generateContent - items: ${contents.length}, hasFile: ${!!options.base64Data}`
    );

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
