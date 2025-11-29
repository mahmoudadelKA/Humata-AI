import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, ArrowLeft, Loader2, Search, Link2, Radio } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { ConversationsSidebar } from "@/components/ConversationsSidebar";
import { queryClient } from "@/lib/queryClient";

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

const getPersonaInfo = (persona: string | null) => {
  const personas: Record<string, any> = {
    chat: {
      title: "الدردشة",
      description: "محادثة ذكية متقدمة مع Gemini 2.5 Pro",
      systemPrompt: `أنت مساعد ذكاء اصطناعي متقدم. قدم إجابات مفيدة وصحيحة ومدروسة على استفسارات المستخدمين. الرد بصيغة عربية سليمة.`,
      controlIcons: ["upload"],
    },
    ask: {
      title: "اسأل",
      description: "أسئلة ذكية مع 3 خيارات",
      systemPrompt: `أنت مساعد ذكاء اصطناعي متخصص في الإجابة على الأسئلة. قدم إجابات دقيقة وشاملة ومفيدة. الرد بصيغة عربية سليمة.`,
      controlIcons: ["upload", "search", "ai-only"],
    },
  };
  
  if (persona && personas[persona]) {
    return personas[persona];
  }
  return personas.chat;
};

export default function Chat() {
  const [searchParams] = useLocation();
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : searchParams);
  const persona = params.get("persona") || "";
  const mode = params.get("mode") || "";
  const convId = params.get("convId") || ""; 
  const initialMessage = params.get("initialMessage") || "";
  const { language, user, token } = useAppContext();

  const personaInfo = getPersonaInfo(persona || null);
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>(convId);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [enableGrounding, setEnableGrounding] = useState(persona === "ask" ? true : false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSentRef = useRef(false);

  // Load messages when conversationId changes
  useEffect(() => {
    if (conversationId) {
      const loadConversationMessages = async () => {
        try {
          const response = await fetch(`/api/conversations/${conversationId}`, {
            credentials: "include",
          });
          if (response.ok) {
            const conversation = await response.json();
            if (conversation && conversation.messages) {
              setMessages(conversation.messages);
            }
          }
        } catch (error) {
          console.error("Failed to load conversation:", error);
        }
      };
      loadConversationMessages();
    }
  }, [conversationId]);

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
        credentials: "include", // Send cookies
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
        credentials: "include", // Send cookies (JWT) automatically
        body: JSON.stringify({
          message: data.message,
          conversationId,
          persona: persona || undefined,
          systemPrompt: personaInfo.systemPrompt,
          enableGrounding: enableGrounding,
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
      setConversationId(data.sessionId);
      setUploadedFileInfo(null);
      // Refresh conversations list when a new message is sent
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
    },
    onError: (error: any) => {
      toast({
        title: "Message failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Auto-send initial message from Hub
  useEffect(() => {
    if (initialMessage && !autoSentRef.current) {
      autoSentRef.current = true;
      const userMessage = {
        id: Date.now().toString(),
        role: "user" as const,
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      
      // Send the message to AI - using setTimeout to ensure mutation is ready
      const timer = setTimeout(() => {
        sendMessageMutation.mutate({
          message: initialMessage,
        });
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [initialMessage, sendMessageMutation]);

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

  // For embedded content like Google Images or AI Images
  if (persona === "google-images") {
    return (
      <div className="min-h-screen bg-background cyber-grid flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
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
        <main className="flex-1 overflow-hidden w-full flex items-center justify-center">
          <div className="text-center">
            <p className={`text-foreground mb-6 ${language === "ar" ? "text-lg" : ""}`}>
              {language === "ar" ? "انقر على الزر أدناه للوصول إلى Google Images" : "Click the button below to access Google Images"}
            </p>
            <a 
              href="https://images.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                data-testid="open-google-images"
                className="px-8"
              >
                {language === "ar" ? "فتح Google Images" : "Open Google Images"}
              </Button>
            </a>
          </div>
        </main>
      </div>
    );
  }

  if (persona === "images") {
    return (
      <div className="min-h-screen bg-background cyber-grid flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50 sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
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
        <main className="flex-1 overflow-hidden w-full flex items-center justify-center">
          <div className="text-center">
            <p className={`text-foreground mb-6 ${language === "ar" ? "text-lg" : ""}`}>
              {language === "ar" ? "انقر على الزر أدناه للوصول إلى محرك البحث عن الصور Kiira AI" : "Click the button below to access Kiira AI image search"}
            </p>
            <a 
              href="https://www.kiira.ai/chat-page/group/d4jlfsnngsas7395p9t0?agentAccountNo=seagen_nano_banana_2_agent&routeName=search&categoryId=Recommend"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button 
                size="lg"
                data-testid="open-kiira-images"
                className="px-8"
              >
                {language === "ar" ? "فتح Kiira AI" : "Open Kiira AI"}
              </Button>
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
      <header className="border-b border-border/30 backdrop-blur-sm bg-background/50 sticky top-0 z-40">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className={`text-lg font-bold text-foreground ${language === "ar" ? "text-xl" : ""}`}>
              {personaInfo.title}
            </h2>
            {conversationId && <span className="text-xs text-muted-foreground">{conversationId.substring(0, 8)}</span>}
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

      <main className="flex-1 overflow-hidden flex flex-row">
        {user && (
          <ConversationsSidebar 
            onSelectConversation={(id) => setConversationId(id)}
            currentConversationId={conversationId}
          />
        )}
        <div className="flex-1 overflow-y-auto flex flex-col px-6 py-8">
          <div className="max-w-3xl w-full mx-auto space-y-6 flex-1">
          {messages.length === 0 ? (
            <div className="h-full" />
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

            {personaInfo.controlIcons?.includes("upload") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadFileMutation.isPending || sendMessageMutation.isPending}
                data-testid="button-upload-file"
                className="h-8 w-8"
                title={language === "ar" ? "رفع ملف" : "Upload File"}
              >
                {uploadFileMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </Button>
            )}

            {personaInfo.controlIcons?.includes("search") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEnableGrounding(!enableGrounding)}
                disabled={sendMessageMutation.isPending}
                data-testid="button-search"
                className={`h-8 w-8 ${enableGrounding ? "text-primary" : ""}`}
                title={language === "ar" ? "بحث جوجل" : "Google Search"}
              >
                <Search className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("ai-only") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEnableGrounding(false)}
                disabled={sendMessageMutation.isPending}
                data-testid="button-ai-only"
                className={`h-8 w-8 ${!enableGrounding ? "text-primary" : ""}`}
                title={language === "ar" ? "ذكاء فقط" : "AI Only"}
              >
                <Radio className="w-4 h-4" />
              </Button>
            )}

            {persona === "chat" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUrlModal(true)}
                disabled={sendMessageMutation.isPending}
                data-testid="button-url"
                className="h-8 w-8"
                title={language === "ar" ? "إضافة رابط" : "Add URL"}
              >
                <Link2 className="w-4 h-4" />
              </Button>
            )}

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

          {showUrlModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-lg w-96 shadow-lg">
                <h3 className="font-bold mb-4">{language === "ar" ? "إضافة رابط" : "Add URL"}</h3>
                <Input
                  placeholder={language === "ar" ? "الصق الرابط هنا..." : "Paste URL here..."}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="mb-4"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      setShowUrlModal(false);
                      setUrlInput("");
                    }} 
                    variant="outline" 
                    className="flex-1"
                  >
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button 
                    onClick={() => {
                      if (urlInput.trim()) {
                        const userMessage = {
                          id: Date.now().toString(),
                          role: "user" as const,
                          content: `${urlInput}`,
                          timestamp: new Date(),
                        };
                        setMessages((prev) => [...prev, userMessage]);
                        setInputValue("");
                        sendMessageMutation.mutate({
                          message: `يرجى جلب محتوى هذا الرابط ومناقشته معي: ${urlInput}`,
                        });
                        setShowUrlModal(false);
                        setUrlInput("");
                      }
                    }} 
                    className="flex-1"
                  >
                    {language === "ar" ? "تم" : "Done"}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </footer>
    </div>
  );
}
