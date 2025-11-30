import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Send, ArrowLeft, Loader2, Search, Link2, Radio, BookOpen, Globe, FileText, Database, HelpCircle, GripVertical, Settings } from "lucide-react";
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
    research: {
      title: "البحث العلمي",
      description: "بحث متقدم من مصادر علمية موثوقة",
      systemPrompt: `أنت باحث متخصص بخبرة عالية في البحث العلمي. عندما يطلب المستخدم بحثاً عن أي موضوع (تاريخي، جغرافي، طبي، علمي، معرفي، إلخ):

1. قم بالبحث الشامل في المصادر العالمية:
   - Google Scholar (scholar.google.com) للدراسات الأكاديمية
   - PubMed (pubmed.ncbi.nlm.nih.gov) للأبحاث الطبية والعلمية
   - ResearchGate (researchgate.net) للأبحاث والدراسات
   - المكتبات الرقمية العالمية للمعلومات الموثوقة

2. في كل إجابة، يجب أن تتضمن:
   - شرح مفصل للموضوع من مصادر موثوقة
   - إحصائيات وبيانات حقيقية من الأبحاث العلمية
   - استشهادات من الدراسات المعروفة
   - المراجع العلمية والروابط ذات الصلة
   - تحليل شامل يغطي جميع جوانب الموضوع

3. اجعل البحث:
   - دقيقاً وموثوقاً وعلمياً
   - مع الاستشهادات الكاملة
   - يشمل وجهات نظر متعددة إن وجدت
   - يركز على المصادر المعترف بها عالمياً

4. الرد بصيغة عربية سليمة وواضحة مع تنسيق منظم.`,
      controlIcons: ["google-scholar", "pubmed", "research-db"],
    },
    "google-images": {
      title: "توليد الصور",
      description: "بحث وعرض أفضل الصور",
      systemPrompt: `You are a specialized Google Image Search engine. When receiving a user query, you MUST use the integrated Google Search tool to find and return ONLY direct image file URLs (.jpg, .png, .webp, .gif).

CRITICAL REQUIREMENTS:
1. Return ONLY a valid JSON array of image objects with direct URLs
2. Do NOT return links to web pages containing images
3. Return ONLY direct image file URLs (ending in .jpg, .png, .webp, .gif)
4. Return a MINIMUM of 10 direct image URLs (ten or more)
5. ENFORCE EXTREME RELEVANCY - DO NOT include ANY irrelevant images (e.g., food for space queries, animals for weather queries)
6. Only return images that STRICTLY MATCH the user's keywords and search intent
7. Prioritize HIGH-RESOLUTION, HIGH-QUALITY image links
8. DO NOT return any preamble text or conversational language

Return format MUST be exactly:
[{"url":"https://example.com/image.jpg","title":"description_1"},{"url":"https://example.com/photo.png","title":"description_2"},...] (minimum 10 objects with direct URLs, all strictly relevant)`,
      controlIcons: ["search"],
    },
    quizzes: {
      title: "الاختبارات",
      description: "إنشاء اختبارات تفاعلية من المصادر",
      systemPrompt: `أنت متخصص في إنشاء الاختبارات التفاعلية. عندما يزودك المستخدم بمصدر (ملف أو رابط URL)، قم بـ:
1. تحليل المصدر بعناية
2. استخراج المعلومات الرئيسية
3. إنشاء أسئلة متعددة الخيارات (10-15 أسئلة)
4. صياغة الأسئلة بوضوح وصيغة عربية سليمة

إرجع الإجابات والتفسيرات مع كل سؤال.`,
      controlIcons: ["upload-source", "url-input"],
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
  const [showQuizzesMenu, setShowQuizzesMenu] = useState(false);
  const [showQuizzesSettings, setShowQuizzesSettings] = useState(false);
  const [quizNumQuestions, setQuizNumQuestions] = useState("10");
  const [quizQuestionType, setQuizQuestionType] = useState("multiple-choice");
  const [quizDifficulty, setQuizDifficulty] = useState("medium");
  const [enableGrounding, setEnableGrounding] = useState(persona === "ask" || persona === "research" ? true : false);
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
          enableGrounding: persona === "research" ? true : enableGrounding,
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

    const messageToSend = persona === "quizzes" 
      ? `${userMessage.content}\n\n[Quiz Settings: ${quizNumQuestions} questions, Type: ${quizQuestionType}, Difficulty: ${quizDifficulty}]`
      : userMessage.content;
    
    sendMessageMutation.mutate({
      message: messageToSend,
      base64Data: uploadedFileInfo?.base64Data,
      fileName: uploadedFileInfo?.fileName,
      mimeType: uploadedFileInfo?.mimeType,
    });
  };

  const handleFileSelect = async (file: File) => {
    uploadFileMutation.mutate(file);
  };


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
              {messages.map((msg) => {
                // Extract image URLs from JSON format in AI responses (for google-images persona)
                let isImageMessage = false;
                let imageUrls: Array<{url: string; title: string}> = [];
                
                if (msg.role === "assistant" && persona === "google-images") {
                  try {
                    // Try to parse JSON array from the response
                    // Extract JSON if there's any preamble text
                    const jsonMatch = msg.content.match(/\[\s*\{[\s\S]*\}\s*\]/);
                    if (jsonMatch) {
                      const images = JSON.parse(jsonMatch[0]);
                      if (Array.isArray(images) && images.length > 0) {
                        imageUrls = images.map((img: any) => ({
                          url: img.url || "",
                          title: img.title || "صورة"
                        })).filter(img => img.url);
                        if (imageUrls.length > 0) {
                          isImageMessage = true;
                        }
                      }
                    }
                  } catch (e) {
                    // If JSON parsing fails, continue as normal message
                  }
                }
                
                return (
                <div
                  key={msg.id}
                  className={`flex w-full ${msg.role === "assistant" ? "justify-start" : "justify-end"}`}
                  data-testid={`message-${msg.id}`}
                >
                  {isImageMessage && msg.role === "assistant" && imageUrls.length > 0 ? (
                    <div className="max-w-6xl w-full space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {imageUrls.map((img, idx) => {
                          // Use image proxy to bypass hotlinking restrictions
                          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(img.url)}`;
                          return (
                          <div key={idx} className="relative group overflow-hidden rounded-lg aspect-square image-container">
                            <img 
                              src={proxyUrl} 
                              alt={img.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Hide the entire parent container on image load failure
                                const container = (e.currentTarget.closest('.image-container') as HTMLElement);
                                if (container) {
                                  container.style.display = 'none';
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <a 
                                href={img.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                              >
                                <Button
                                  size="sm"
                                  variant="default"
                                  data-testid={`button-download-${idx}`}
                                >
                                  {language === "ar" ? "تحميل" : "Download"}
                                </Button>
                              </a>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
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
                  )}
                </div>
              );
              })}
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

            {personaInfo.controlIcons?.includes("google-scholar") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open("https://scholar.google.com/", "_blank")}
                disabled={sendMessageMutation.isPending}
                data-testid="button-google-scholar"
                className="h-8 w-8"
                title={language === "ar" ? "Google Scholar" : "Google Scholar"}
              >
                <Globe className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("pubmed") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open("https://pubmed.ncbi.nlm.nih.gov/", "_blank")}
                disabled={sendMessageMutation.isPending}
                data-testid="button-pubmed"
                className="h-8 w-8"
                title={language === "ar" ? "PubMed" : "PubMed"}
              >
                <FileText className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("research-db") && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open("https://www.researchgate.net/", "_blank")}
                disabled={sendMessageMutation.isPending}
                data-testid="button-research-db"
                className="h-8 w-8"
                title={language === "ar" ? "ResearchGate" : "ResearchGate"}
              >
                <Database className="w-4 h-4" />
              </Button>
            )}

            {personaInfo.controlIcons?.includes("upload-source") && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFileMutation.isPending}
                  data-testid="button-upload-source"
                  className="h-8 w-8"
                  title={language === "ar" ? "رفع مصدر" : "Upload Source"}
                >
                  <Upload className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowUrlModal(true)}
                  disabled={sendMessageMutation.isPending}
                  data-testid="button-url-input"
                  className="h-8 w-8"
                  title={language === "ar" ? "رابط URL" : "URL Link"}
                >
                  <Link2 className="w-4 h-4" />
                </Button>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowQuizzesSettings(!showQuizzesSettings)}
                    disabled={sendMessageMutation.isPending}
                    data-testid="button-quiz-settings"
                    className="h-8 w-8"
                    title={language === "ar" ? "إعدادات الاختبار" : "Quiz Settings"}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  {showQuizzesSettings && (
                    <div className="absolute bottom-10 right-0 bg-card border border-border rounded-lg shadow-lg z-50 p-3 w-72">
                      <h4 className="font-bold mb-3 text-sm">{language === "ar" ? "إعدادات الاختبار" : "Quiz Settings"}</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold mb-1 block">{language === "ar" ? "عدد الأسئلة" : "Number of Questions"}</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={quizNumQuestions}
                            onChange={(e) => setQuizNumQuestions(e.target.value)}
                            data-testid="input-quiz-count"
                            className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="text-xs font-semibold mb-1 block">{language === "ar" ? "نوع الأسئلة" : "Question Type"}</label>
                          <select
                            value={quizQuestionType}
                            onChange={(e) => setQuizQuestionType(e.target.value)}
                            data-testid="select-question-type"
                            className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
                          >
                            <option value="multiple-choice">{language === "ar" ? "اختيار من متعدد" : "Multiple Choice"}</option>
                            <option value="true-false">{language === "ar" ? "صح/خطأ" : "True/False"}</option>
                            <option value="mixed">{language === "ar" ? "مختلط" : "Mixed"}</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-xs font-semibold mb-1 block">{language === "ar" ? "مستوى الصعوبة" : "Difficulty Level"}</label>
                          <select
                            value={quizDifficulty}
                            onChange={(e) => setQuizDifficulty(e.target.value)}
                            data-testid="select-difficulty"
                            className="w-full px-2 py-1 rounded border border-border bg-background text-sm"
                          >
                            <option value="easy">{language === "ar" ? "سهل" : "Easy"}</option>
                            <option value="medium">{language === "ar" ? "متوسط" : "Medium"}</option>
                            <option value="hard">{language === "ar" ? "صعب" : "Hard"}</option>
                          </select>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowQuizzesSettings(false)}
                          data-testid="button-close-settings"
                          className="w-full mt-2"
                        >
                          {language === "ar" ? "تم" : "Done"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </>
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
