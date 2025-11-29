import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, ArrowLeft, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";

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
  const { language } = useAppContext();

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
    <div className="min-h-screen bg-background cyber-grid flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/50 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className={`text-lg font-bold text-foreground ${language === "ar" ? "text-xl" : ""}`}>
              {personaInfo.title}
            </h2>
          </div>
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex flex-col">
        <div className="max-w-3xl w-full mx-auto px-6 py-8 space-y-6 flex-1">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4 opacity-10">◆</div>
              <p className="text-muted-foreground mb-2">{t("chat.no-messages", language)}</p>
              <p className="text-xs text-muted-foreground/50">
                {t("chat.start", language)}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                  data-testid={`message-${msg.id}`}
                >
                  <div
                    className={`max-w-2xl px-5 py-3 rounded-2xl ${
                      msg.role === "assistant"
                        ? "bg-muted/40 text-foreground ai-message"
                        : "bg-primary/30 text-foreground"
                    }`}
                  >
                    <p className={`whitespace-pre-wrap leading-relaxed ${language === "ar" ? "text-lg font-bold" : "text-sm"}`}>
                      {msg.content}
                    </p>
                    {msg.fileInfo && (
                      <div className="mt-3 pt-3 border-t border-border/20 text-xs text-muted-foreground flex items-center gap-2">
                        <Upload className="w-3 h-3" />
                        {msg.fileInfo.name}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {sendMessageMutation.isPending && (
                <div className="flex w-full justify-start">
                  <div className="max-w-2xl px-5 py-3 rounded-2xl bg-muted/40 text-foreground flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-accent animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-primary animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{t("chat.thinking", language)}</p>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-border/30 bg-background/95 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-3xl w-full mx-auto px-6 py-6 space-y-4">
          {uploadedFileInfo && (
            <div className="p-3 bg-accent/10 border border-accent/30 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                <span>{uploadedFileInfo.fileName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUploadedFileInfo(null)}
                data-testid="button-clear-file"
                className="h-6 px-2"
              >
                ✕
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 bg-muted/30 rounded-full pl-5 pr-2 py-2 border border-border/20 focus-within:outline-none focus-within:ring-0">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="hidden"
              data-testid="input-file"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadFileMutation.isPending || sendMessageMutation.isPending}
              data-testid="button-upload-file"
              className="h-8 w-8"
            >
              {uploadFileMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>

            <Input
              placeholder={t("chat.placeholder", language)}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sendMessageMutation.isPending}
              data-testid="input-message"
              className="border-0 bg-transparent placeholder:text-muted-foreground/50 !ring-0 !outline-none focus-visible:!ring-0 focus-visible:!outline-none focus:!ring-0 focus:!outline-none ring-offset-0 focus-visible:ring-offset-0 flex-1"
            />

            <Button
              onClick={handleSendMessage}
              disabled={
                !inputValue.trim() &&
                !uploadedFileInfo &&
                sendMessageMutation.isPending
              }
              data-testid="button-send"
              size="icon"
              className="h-8 w-8 rounded-full"
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
