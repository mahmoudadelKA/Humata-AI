import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";

// DON'T DELETE THIS COMMENT
// Using blueprint:javascript_gemini integration
// The newest Gemini model series is "gemini-2.5-flash" or "gemini-2.5-pro"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL_NAME = "gemini-2.5-flash";

export interface GeminiChatOptions {
  systemPrompt?: string;
  fileUri?: string;
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
    
    // Add file data if URI is provided
    if (options.fileUri && options.mimeType) {
      console.log(`[Gemini] Adding file reference - URI: ${options.fileUri}, type: ${options.mimeType}`);
      userParts.push({
        fileData: {
          mimeType: options.mimeType,
          fileUri: options.fileUri,
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

    console.log(`[Gemini] Sending generateContent - items: ${contents.length}, hasFile: ${!!options.fileUri}`);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config,
    });

    console.log(`[Gemini] Response received`);
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
): Promise<{ fileUri: string; mimeType: string; fileName: string }> {
  try {
    console.log(`[Gemini] Uploading file - file: ${fileName}, type: ${mimeType}`);
    
    const fileBytes = fs.readFileSync(filePath);
    
    // Upload file to Gemini File API using proper structure
    const uploadResult = await ai.files.upload({
      file: {
        mimeType: mimeType,
        displayName: fileName,
        data: fileBytes,
      },
    });

    if (!uploadResult.uri) {
      throw new Error("File upload failed - no URI returned");
    }

    console.log(`[Gemini] File uploaded - URI: ${uploadResult.uri}`);

    // Wait for file processing to complete
    let file = uploadResult;
    let attempts = 0;
    while (file.state === "PROCESSING" && attempts < 30) {
      console.log(`[Gemini] Processing... (${attempts + 1}/30)`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const getResult = await ai.files.get({ name: file.name! });
      file = getResult;
      attempts++;
    }

    if (file.state === "FAILED") {
      throw new Error("File processing failed");
    }

    if (file.state === "PROCESSING") {
      throw new Error("File processing timeout");
    }

    console.log(`[Gemini] File ready - state: ${file.state}`);

    return {
      fileUri: file.uri!,
      mimeType: file.mimeType!,
      fileName: fileName,
    };
  } catch (error: any) {
    console.error("[Gemini] File upload error:", error);
    throw new Error(error.message || "Failed to upload file to Gemini");
  }
}
