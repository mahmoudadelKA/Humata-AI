import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MODEL_NAME = "gemini-2.5-flash";

export interface GeminiChatOptions {
  systemPrompt?: string;
  fileUri?: string;
  fileName?: string;
  mimeType?: string;
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
    
    if (options.fileUri && options.mimeType) {
      userParts.push({
        fileData: {
          fileUri: options.fileUri,
          mimeType: options.mimeType,
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

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents,
      config,
    });

    return response.text || "I apologize, but I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API error:", error);
    throw new Error(error.message || "Failed to generate response from AI");
  }
}

export async function uploadFileToGemini(
  filePath: string,
  mimeType: string,
  displayName: string
): Promise<{ uri: string; name: string; mimeType: string }> {
  try {
    const fileBytes = fs.readFileSync(filePath);
    const base64Data = fileBytes.toString("base64");
    
    const uploadResult = await ai.files.upload({
      file: {
        mimeType,
        displayName,
        data: base64Data,
      },
    });

    if (!uploadResult.uri) {
      throw new Error("File upload failed - no URI returned");
    }

    let file = uploadResult;
    while (file.state === "PROCESSING") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const getResult = await ai.files.get({ name: file.name! });
      file = getResult;
    }

    if (file.state === "FAILED") {
      throw new Error("File processing failed");
    }

    return {
      uri: file.uri!,
      name: file.name!,
      mimeType: file.mimeType!,
    };
  } catch (error: any) {
    console.error("File upload error:", error);
    throw new Error(error.message || "Failed to upload file to Gemini");
  }
}

export async function analyzeImageBase64(
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
    console.error("Image analysis error:", error);
    throw new Error(error.message || "Failed to analyze image");
  }
}
