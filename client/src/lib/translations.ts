export type Language = "ar" | "en";

export const translations: Record<Language, Record<string, string>> = {
  ar: {
    "system.active": "النظام نشط",
    "hub.select": "اختر قسماً",
    "hub.description": "وحدات الذكاء الاصطناعي المتقدمة",
    "hub.powered": "مدعوم من",
    "hub.system": "المبرمج محمود عادل",
    "chat.no-messages": "لا توجد رسائل حتى الآن",
    "chat.start": "ارفع ملف أو أرسل رسالة لتبدأ المحادثة",
    "chat.thinking": "جاري التفكير...",
    "chat.placeholder": "اكتب رسالتك...",
    "hub.chat.input": "أسال الذكاء الاصطناعي...",
    "hub.chat.send": "إرسال",
    "feature.chat": "الدردشة",
  },
  en: {
    "system.active": "System Active",
    "hub.select": "Select Interface",
    "hub.description": "Advanced AI Modules",
    "hub.powered": "Powered by",
    "hub.system": "Programmer: Mahmoud Adel",
    "chat.no-messages": "No messages yet",
    "chat.start": "Upload a file or send a message to begin",
    "chat.thinking": "Thinking...",
    "chat.placeholder": "Type your message...",
    "hub.chat.input": "Ask the AI...",
    "hub.chat.send": "Send",
    "feature.chat": "Chat",
  },
};

export const t = (key: string, language: Language): string => {
  return translations[language]?.[key] || key;
};
