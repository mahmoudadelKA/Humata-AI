import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  fileInfo?: { name: string; type: string };
}

interface ChatResponse {
  message: Message;
  sessionId: string;
}

interface UploadedFileInfo {
  base64Data: string;
  fileName: string;
  mimeType: string;
}

const getPersonaInfo = (persona?: string) => {
  const personas: Record<
    string,
    { title: string; description: string; systemPrompt: string }
  > = {
    khedive: {
      title: "الخديوي - المستشار الاستراتيجي",
      description: "تحليل استراتيجي متقدم واتخاذ القرارات",
      systemPrompt: `أنت الخديوي، مستشار استراتيجي متقدم. توفر تحليل عميق، رؤى استراتيجية وإرشادات مدروسة حول القرارات المعقدة. استجاباتك شاملة، استراتيجية وموجهة لمساعدة المستخدمين في التغلب على التحديات بثقة.`,
    },
    doctor: {
      title: "مستشار صحي - مساعد طبي",
      description: "معلومات طبية وآفاق صحية",
      systemPrompt: `أنت مساعد معلومات طبية. توفر معلومات تعليمية حول المواضيع الصحية. تحذير مهم: تذكر دائماً أن المستخدمين يجب عليهم استشارة متخصصي الرعاية الصحية المؤهلين للتشخيص والعلاج.`,
    },
  };
  return (
    personas[persona || ""] || {
      title: "الحدثة",
      description: "محادثة ذكية متقدمة",
      systemPrompt: `أنت مساعد ذكاء اصطناعي متقدم. قدم إجابات مفيدة وصحيحة ومدروسة على استفسارات المستخدمين. الرد بصيغة عربية سليمة.`,
    }
  );
};

export default function Chat() {
  const [searchParams] = useLocation();
  const params = new URLSearchParams(searchParams.split("?")[1] || "");
  const persona = params.get("persona") || "";
  const mode = params.get("mode") || "";

  const personaInfo = getPersonaInfo(persona);
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        throw new Error(errorData.error || "Upload failed");
      }

      return response.json() as Promise<UploadedFileInfo>;
    },
    onSuccess: (data) => {
      setUploadedFileInfo(data);
      toast({
        title: "File uploaded",
        description: `${data.fileName} ready for analysis`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: {
      message: string;
      base64Data?: string;
      fileName?: string;
      mimeType?: string;
    }) => {
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
    onError: (error: any) => {
      toast({
        title: "Message failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !uploadedFileInfo) {
      return;
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: inputValue || (uploadedFileInfo ? "Analyze this file" : ""),
      timestamp: new Date(),
      fileInfo: uploadedFileInfo
        ? { name: uploadedFileInfo.fileName, type: uploadedFileInfo.mimeType }
        : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    sendMessageMutation.mutate({
      message: userMessage.content,
      base64Data: uploadedFileInfo?.base64Data,
      fileName: uploadedFileInfo?.fileName,
      mimeType: uploadedFileInfo?.mimeType,
    });
  };

  const handleFileSelect = async (file: File) => {
    uploadFileMutation.mutate(file);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex flex-col">
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h2 className="text-xl font-bold text-glow-cyan text-foreground">
                {personaInfo.title}
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                {personaInfo.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-4">
          {messages.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4 opacity-10">◆</div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-xs text-muted-foreground/50">
                Upload a file or send a message to begin
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                data-testid={`message-${msg.id}`}
              >
                <Card
                  className={`max-w-2xl p-4 ${
                    msg.role === "assistant"
                      ? "bg-accent/10 border-accent/20"
                      : "bg-primary/10 border-primary/20"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.fileInfo && (
                    <div className="mt-2 pt-2 border-t border-border/20 text-xs text-muted-foreground">
                      📎 {msg.fileInfo.name}
                    </div>
                  )}
                </Card>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-4">
          {uploadedFileInfo && (
            <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg text-xs">
              <div className="flex items-center justify-between">
                <span>📎 {uploadedFileInfo.fileName}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setUploadedFileInfo(null)}
                  data-testid="button-clear-file"
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              data-testid="input-file"
            />

            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFileMutation.isPending || sendMessageMutation.isPending}
              data-testid="button-upload-file"
            >
              {uploadFileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>

            <Input
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
            />

            <Button
              onClick={handleSendMessage}
              disabled={
                !inputValue.trim() &&
                !uploadedFileInfo &&
                sendMessageMutation.isPending
              }
              data-testid="button-send"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
