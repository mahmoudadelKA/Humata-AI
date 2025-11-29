import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, ArrowLeft, Loader2, Search, Settings, Download, Link2, Radio } from "lucide-react";
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

const getPersonaInfo = (persona?: string) => {
  const personas: Record<
    string,
    { title: string; description: string; systemPrompt: string; controlIcons?: string[] }
  > = {
    ask: {
      title: "اسأل",
      description: "أسئلة سريعة وذكية",
      systemPrompt: `أنت مساعد ذكاء اصطناعي متقدم متخصص في الإجابة على الأسئلة. قدم إجابات دقيقة وشاملة ومفيدة. الرد بصيغة عربية سليمة.`,
      controlIcons: ["upload", "search", "ai-only"],
    },
    research: {
      title: "البحث العلمي",
      description: "بحث أكاديمي متقدم",
      systemPrompt: `أنت باحث أكاديمي متقدم متخصص. قدم تحليلات عميقة، استشهادات موثوقة، وبحثاً شاملاً. استخدم مراجع علمية موثوقة. الرد بصيغة عربية أكاديمية.`,
      controlIcons: ["download"],
    },
    tests: {
      title: "الاختبارات",
      description: "إنشاء واختبار المعرفة",
      systemPrompt: `أنت خبير في إنشاء الاختبارات والتقييمات التعليمية. أنشئ أسئلة دقيقة ومناسبة للمستوى المطلوب. الرد بصيغة عربية واضحة.`,
      controlIcons: ["upload", "link", "settings"],
    },
    doctor: {
      title: "الدكتور - مستشار صحي",
      description: "معلومات طبية وآفاق صحية",
      systemPrompt: `أنت طبيب متخصص وباحث طبي. توفر معلومات طبية تعليمية دقيقة. تحذير مهم: تذكر دائماً أن المستخدمين يجب عليهم استشارة متخصصي الرعاية الصحية المؤهلين. الرد بصيغة عربية طبية.`,
      controlIcons: ["upload", "search"],
    },
    scientist: {
      title: "المساعد العلمي",
      description: "مساعد أكاديمي متخصص",
      systemPrompt: `أنت باحث ومساعد أكاديمي متعدد المجالات. توفر تحليلات عميقة، توضيحات علمية وإجابات شاملة على أسئلة متقدمة. الرد بصيغة عربية أكاديمية.`,
      controlIcons: ["upload", "search"],
    },
    khedive: {
      title: "الخديوي - المستشار الاستراتيجي",
      description: "تحليل استراتيجي متقدم واتخاذ القرارات",
      systemPrompt: `أنت الخديوي، مستشار استراتيجي متقدم. توفر تحليل عميق، رؤى استراتيجية وإرشادات مدروسة حول القرارات المعقدة. استجاباتك شاملة، استراتيجية وموجهة لمساعدة المستخدمين في التغلب على التحديات بثقة.`,
    },
    images: {
      title: "صور ذكاء اصطناعي",
      description: "محرك البحث عن الصور المتقدم",
      systemPrompt: "",
      isEmbedded: true,
    },
  };
  return (
    personas[persona || ""] || {
      title: "الدردشة",
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
  const convId = params.get("convId") || ""; // Get conversation ID from Hub
  const initialMessage = params.get("initialMessage") || ""; // Message from Hub search box
  const { language, user, token } = useAppContext();

  const personaInfo = getPersonaInfo(persona);
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>(convId);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [enableGrounding, setEnableGrounding] = useState(["research", "doctor", "scientist"].includes(persona));
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [quizSettings, setQuizSettings] = useState({ difficulty: "medium", questions: 10, type: "multiple" });
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
      setConversationId(data.conversationId);
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

  // For embedded content like images (AI Images section)
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
        <main className="flex-1 overflow-hidden w-full">
          <iframe
            src="/api/proxy-iframe"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              borderRadius: "0",
              backgroundColor: "transparent",
            }}
            title="Kiira AI Images"
            data-testid="embedded-iframe"
            allow="accelerometer; camera; geolocation; gyroscope; magnetometer; microphone; payment; usb"
            allowFullScreen
          />
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
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4 opacity-10">◆</div>
              <p className={`text-foreground mb-2 font-semibold ${language === "ar" ? "text-lg" : ""}`}>{personaInfo.title}</p>
              <p className={`text-muted-foreground/70 max-w-md ${language === "ar" ? "text-lg" : "text-sm"}`}>
                {personaInfo.description}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-4">
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
                title={t("chat.file-upload", language)}
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
                data-testid="button-grounding"
                className={`h-8 w-8 ${enableGrounding ? "text-primary" : ""}`}
                title={t("chat.google-search", language)}
              >
                <Search className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("ai-only") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEnableGrounding(false)}
                data-testid="button-ai-only"
                className={`h-8 w-8 ${!enableGrounding ? "text-primary" : ""}`}
                title={t("chat.ai-only", language)}
              >
                <Radio className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("link") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUrlModal(true)}
                data-testid="button-url"
                className="h-8 w-8"
                title={t("chat.url-input", language)}
              >
                <Link2 className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("settings") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettingsModal(true)}
                data-testid="button-settings"
                className="h-8 w-8"
                title={t("chat.settings", language)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("download") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const text = messages.map(m => `${m.role === "assistant" ? "AI" : "User"}: ${m.content}`).join("\n\n");
                  const blob = new Blob([text], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `research-${Date.now()}.txt`;
                  a.click();
                }}
                data-testid="button-download"
                className="h-8 w-8"
                title={t("chat.download", language)}
              >
                <Download className="w-4 h-4" />
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
                <h3 className="font-bold mb-4">{t("chat.url-input", language)}</h3>
                <Input
                  placeholder="https://example.com"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="mb-4"
                />
                <div className="flex gap-2">
                  <Button onClick={() => setShowUrlModal(false)} variant="outline" className="flex-1">{language === "ar" ? "إلغاء" : "Cancel"}</Button>
                  <Button onClick={() => { setUrlInput(""); setShowUrlModal(false); }} className="flex-1">{language === "ar" ? "تم" : "Done"}</Button>
                </div>
              </div>
            </div>
          )}

          {showSettingsModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-lg w-96 shadow-lg">
                <h3 className="font-bold mb-4">{t("chat.settings", language)}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm mb-2 block">{language === "ar" ? "المستوى" : "Difficulty"}</label>
                    <select value={quizSettings.difficulty} onChange={(e) => setQuizSettings({...quizSettings, difficulty: e.target.value})} className="w-full p-2 border rounded">
                      <option value="easy">{language === "ar" ? "سهل" : "Easy"}</option>
                      <option value="medium">{language === "ar" ? "متوسط" : "Medium"}</option>
                      <option value="hard">{language === "ar" ? "صعب" : "Hard"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">{language === "ar" ? "عدد الأسئلة" : "Questions"}</label>
                    <Input type="number" value={quizSettings.questions} onChange={(e) => setQuizSettings({...quizSettings, questions: parseInt(e.target.value)})} min="1" max="50" />
                  </div>
                  <div>
                    <label className="text-sm mb-2 block">{language === "ar" ? "نوع السؤال" : "Type"}</label>
                    <select value={quizSettings.type} onChange={(e) => setQuizSettings({...quizSettings, type: e.target.value})} className="w-full p-2 border rounded">
                      <option value="multiple">{language === "ar" ? "خيارات متعددة" : "Multiple Choice"}</option>
                      <option value="short">{language === "ar" ? "إجابة قصيرة" : "Short Answer"}</option>
                      <option value="essay">{language === "ar" ? "مقالة" : "Essay"}</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setShowSettingsModal(false)} variant="outline" className="flex-1">{language === "ar" ? "إلغاء" : "Cancel"}</Button>
                  <Button onClick={() => setShowSettingsModal(false)} className="flex-1">{language === "ar" ? "تم" : "Done"}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
