import { useLocation } from "wouter";
import { Send, Search } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


export default function Hub() {
  const { language } = useAppContext();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const message = inputValue;
    setInputValue("");
    setLocation(`/chat?initialMessage=${encodeURIComponent(message)}`);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="relative z-10">
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-center flex-col gap-1">
              <h1 className={`text-3xl font-bold text-primary ${language === "ar" ? "text-4xl" : ""}`}>
                HUMATA AI
              </h1>
              <p className={`text-xs text-muted-foreground/70 ${language === "ar" ? "text-sm font-bold" : ""}`}>
                {t("hub.system", language)}
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl">
              <h2 className={`text-4xl font-bold mb-4 text-primary ${language === "ar" ? "text-3xl" : ""}`}>
                {t("hub.welcome", language)}
              </h2>
              <p className={`text-lg text-muted-foreground mb-8 ${language === "ar" ? "text-base" : ""}`}>
                {t("hub.description", language)}
              </p>
              <div className="flex items-center gap-2 bg-card rounded-full pl-5 pr-2 py-3 border border-primary/40 shadow-lg hover:shadow-xl transition-shadow">
                <Search className="w-5 h-5 text-muted-foreground/60" />
                <Input
                  placeholder={t("hub.chat.input", language)}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="border-0 bg-transparent placeholder:text-muted-foreground/50 !ring-0 !outline-none focus-visible:!ring-0 focus-visible:!outline-none focus:!ring-0 focus:!outline-none ring-offset-0 focus-visible:ring-offset-0 flex-1 text-base"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  data-testid="button-send-hub"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
