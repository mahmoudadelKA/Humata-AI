import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, Send, Paperclip, X, Loader2, Bot, User, Image, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, ChatResponse, UploadResponse } from "@shared/schema";

interface FilePreview {
  file: File;
  preview?: string;
  type: "image" | "pdf" | "other";
}

interface UploadedFileInfo {
  base64Data: string;
  fileName: string;
  mimeType: string;
}

function getPersonaInfo(persona: string | null) {
  switch (persona) {
    case "khedive":
      return {
        name: "KHEDIVE AI",
        description: "Strategic Advisor",
        systemPrompt: "You are Khedive, an advanced strategic advisor AI. You excel at analyzing complex situations, providing strategic guidance, and helping with decision-making. Be thoughtful, analytical, and provide structured advice.",
      };
    case "doctor":
      return {
        name: "MED CONSUL",
        description: "Medical Assistant",
        systemPrompt: "You are a medical information assistant. Provide helpful health-related information while always recommending users consult with healthcare professionals for medical decisions. Be informative yet cautious.",
      };
    default:
      return {
        name: "NEURAL CHAT",
        description: "General Assistant",
        systemPrompt: "You are a helpful AI assistant with advanced capabilities. Be concise, helpful, and engaging.",
      };
  }
}

function getModeInfo(mode: string | null) {
  switch (mode) {
    case "vision":
      return { title: "VISION CORE", icon: Image };
    case "docs":
      return { title: "DOC SCANNER", icon: FileText };
    case "quick":
      return { title: "QUICK SYNC", icon: Zap };
    default:
      return { title: null, icon: null };
  }
}

export default function Chat() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const persona = params.get("persona");
  const mode = params.get("mode");
  
  const personaInfo = getPersonaInfo(persona);
  const modeInfo = getModeInfo(mode);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<FilePreview | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { message: string; base64Data?: string; fileName?: string; mimeType?: string }) => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: data.message,
          sessionId,
          persona: persona || undefined,
          systemPrompt: personaInfo.systemPrompt,
          base64Data: data.base64Data,
          fileName: data.fileName,
          mimeType: data.mimeType,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send message");
      }
      
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      setMessages((prev) => [...prev, data.message]);
      setSessionId(data.sessionId);
      setUploadedFileInfo(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to upload file");
      }
      
      return response.json() as Promise<UploadResponse>;
    },
    onSuccess: (data) => {
      if (data.success && data.base64Data) {
        setUploadedFileInfo({
          base64Data: data.base64Data,
          fileName: data.fileName || "file",
          mimeType: data.mimeType || "unknown",
        });
        toast({
          title: "File uploaded",
          description: `${data.fileName} ready for analysis`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setAttachedFile(null);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    
    if (!isImage && !isPdf) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or PDF file",
        variant: "destructive",
      });
      return;
    }

    const fileType = isImage ? "image" : isPdf ? "pdf" : "other";
    const preview = isImage ? URL.createObjectURL(file) : undefined;
    
    setAttachedFile({ file, preview, type: fileType });
    uploadFileMutation.mutate(file);
  };

  const handleRemoveFile = () => {
    if (attachedFile?.preview) {
      URL.revokeObjectURL(attachedFile.preview);
    }
    setAttachedFile(null);
    setUploadedFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput && !uploadedFileInfo) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput || "Analyze this file",
      timestamp: new Date(),
      fileInfo: attachedFile ? {
        name: attachedFile.file.name,
        type: attachedFile.file.type,
      } : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    
    sendMessageMutation.mutate({
      message: trimmedInput || "Please analyze this file and describe what you see.",
      base64Data: uploadedFileInfo?.base64Data,
      fileName: uploadedFileInfo?.fileName,
      mimeType: uploadedFileInfo?.mimeType,
    });
    
    handleRemoveFile();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isLoading = sendMessageMutation.isPending || uploadFileMutation.isPending;

  return (
    <div className="min-h-screen bg-background cyber-grid flex flex-col">
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" data-testid="button-back">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center neon-glow-cyan">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-wider text-foreground">
                    {modeInfo.title || personaInfo.name}
                  </h1>
                  <p className="text-xs text-muted-foreground tracking-wider">
                    {personaInfo.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/30 bg-primary/5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-muted-foreground tracking-wider">CONNECTED</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 neon-glow-cyan">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-foreground">
                  {personaInfo.name}
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  {persona === "khedive" 
                    ? "Ready to assist with strategic analysis and decision-making."
                    : persona === "doctor"
                    ? "Here to provide helpful health information and guidance."
                    : "Ready to assist you. Type a message or upload a file to begin."}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {[
                    mode === "vision" ? "Describe this image" : "Hello, who are you?",
                    mode === "docs" ? "Summarize this document" : "What can you do?",
                    "Help me with a task",
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="px-4 py-2 rounded-lg border border-border/50 bg-card/50 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                      data-testid={`button-suggestion-${i}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.filter((msg) => msg && msg.role && msg.id).map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                data-testid={`message-${message.role}-${message.id}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 ${
                    message.role === "user" ? "message-user" : "message-ai"
                  }`}
                >
                  {message.fileInfo && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      {message.fileInfo.type.startsWith("image") ? (
                        <Image className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span>{message.fileInfo.name}</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>
            ))}

            {sendMessageMutation.isPending && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="message-ai px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-sm text-muted-foreground">Processing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="pt-4 border-t border-border/30">
          {attachedFile && (
            <div className="mb-3 flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
              {attachedFile.type === "image" && attachedFile.preview && (
                <img
                  src={attachedFile.preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded border border-border/50"
                />
              )}
              {attachedFile.type === "pdf" && (
                <div className="w-16 h-16 rounded border border-border/50 bg-muted/20 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-foreground">
                  {attachedFile.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {uploadFileMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                    </span>
                  ) : uploadedFileInfo ? (
                    "Ready for analysis"
                  ) : (
                    "Preparing..."
                  )}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
                disabled={isLoading}
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
              data-testid="input-file"
            />
            
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !!attachedFile}
              className="flex-shrink-0 border-border/50 hover:border-primary/50"
              data-testid="button-attach"
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  attachedFile
                    ? "Describe what you want to know about this file..."
                    : "Type your message..."
                }
                className="min-h-[52px] max-h-[200px] resize-none console-input rounded-lg pr-4"
                disabled={isLoading}
                data-testid="input-message"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading || (!input.trim() && !uploadedFileInfo)}
              className="flex-shrink-0 neon-glow-cyan"
              data-testid="button-send"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground/50 mt-4 tracking-wider">
            NEURAL INTERFACE // GEMINI 3 PRO PREVIEW
          </p>
        </div>
      </main>
    </div>
  );
}
