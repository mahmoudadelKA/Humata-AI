import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import * as path from "path";

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
    console.log(`[Gemini] uploadFileToGemini called - file: ${fileName}, mimeType: ${mimeType}`);
    console.log(`[Gemini] File path: ${filePath}`);
    
    // Read file as Buffer
    const fileBytes = fs.readFileSync(filePath);
    console.log(`[Gemini] File read successfully - size: ${fileBytes.length} bytes`);

    // Create a proper File-like object for the Gemini API
    // The key is to ensure mimeType is properly set
    const fileData = {
      mimeType: mimeType,
      displayName: fileName,
      data: fileBytes,
    };

    console.log(`[Gemini] Calling ai.files.upload with:`, {
      mimeType: fileData.mimeType,
      displayName: fileData.displayName,
      dataSize: fileData.data.length,
    });

    // Upload file to Gemini File API
    // Cast to any to bypass type checking issues with the SDK
    const uploadResult = await (ai.files as any).upload(
      { file: fileData },
      { timeout: 180000 } // 3 minute timeout for large files
    );

    console.log(`[Gemini] Upload API response received`);
    
    if (!uploadResult.file?.uri) {
      console.error("[Gemini] Upload failed - no URI in response");
      console.error("[Gemini] Response:", uploadResult);
      throw new Error("File upload failed - no URI returned from Gemini");
    }

    const fileUri = uploadResult.file.uri;
    console.log(`[Gemini] File uploaded successfully - URI: ${fileUri}, state: ${uploadResult.file.state}`);

    // Wait for file processing to complete
    let file = uploadResult.file;
    let attempts = 0;
    const maxAttempts = 30;
    
    while (file.state === "PROCESSING" && attempts < maxAttempts) {
      console.log(`[Gemini] Waiting for file processing (${attempts + 1}/${maxAttempts})...`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const getResult = await (ai.files as any).get({ name: file.name });
      file = getResult;
      attempts++;
    }

    console.log(`[Gemini] File processing complete - final state: ${file.state}`);

    if (file.state === "FAILED") {
      throw new Error("File processing failed in Gemini API");
    }

    if (file.state === "PROCESSING") {
      throw new Error("File processing timeout - exceeded maximum wait time");
    }

    console.log(`[Gemini] File is ready for use - URI: ${file.uri}`);

    return {
      fileUri: file.uri,
      mimeType: file.mimeType,
      fileName: fileName,
    };
  } catch (error: any) {
    console.error("[Gemini] File upload error:", error);
    console.error("[Gemini] Error stack:", error.stack);
    throw new Error(error.message || "Failed to upload file to Gemini");
  }
}
