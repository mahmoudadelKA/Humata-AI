import { Link, useLocation } from "wouter";
import { MessageSquare, Brain, CheckCircle, Wand2, FileText, Zap, Lightbulb, Users, RefreshCw, Send, HelpCircle, Search, Crown } from "lucide-react";
import { useState } from "react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import type { FeatureCard } from "@shared/schema";

const featureKeys = [
  { id: "chat", titleKey: "feature.chat", icon: "MessageSquare", route: "/chat", glowColor: "cyan" },
  { id: "ask", titleKey: "feature.ask", icon: "HelpCircle", route: "/chat?persona=ask", glowColor: "magenta" },
  { id: "research", titleKey: "feature.research", icon: "Search", route: "/chat?persona=research", glowColor: "purple" },
  { id: "tests", titleKey: "feature.tests", icon: "CheckCircle", route: "/chat?persona=tests", glowColor: "green" },
  { id: "images", titleKey: "feature.images", icon: "Wand2", route: "/chat?persona=images", glowColor: "yellow" },
  { id: "doctor", titleKey: "feature.doctor", icon: "Lightbulb", route: "/chat?persona=doctor", glowColor: "cyan" },
  { id: "scientist", titleKey: "feature.scientist", icon: "Brain", route: "/chat?persona=scientist", glowColor: "magenta" },
  { id: "khedive", titleKey: "feature.khedive", icon: "Crown", route: "/chat?persona=khedive", glowColor: "purple" },
  { id: "ai-images", titleKey: "feature.ai-images", icon: "Zap", route: "https://www.kiira.ai/chat-page/group/d4jlfsnngsas7395p9t0?agentAccountNo=seagen_nano_banana_2_agent&routeName=search&categoryId=Recommend", glowColor: "yellow", external: true },
];

const iconMap: Record<string, typeof MessageSquare> = {
  MessageSquare,
  Brain,
  CheckCircle,
  Wand2,
  FileText,
  Zap,
  Lightbulb,
  Users,
  RefreshCw,
  HelpCircle,
  Search,
  Crown,
};

function FeatureCardComponent({ feature }: { feature: FeatureCard }) {
  const IconComponent = iconMap[feature.icon];
  
  const colorMap: Record<string, { border: string; glow: string; icon: string; shadow: string }> = {
    cyan: { border: "hsl(180 100% 50%)", glow: "neon-icon-simple-cyan", icon: "hsl(180 100% 50%)", shadow: "0 0 12px hsl(180 100% 50% / 0.4), 0 0 24px hsl(180 100% 50% / 0.2)" },
    magenta: { border: "hsl(328 100% 50%)", glow: "neon-icon-simple-magenta", icon: "hsl(328 100% 50%)", shadow: "0 0 12px hsl(328 100% 50% / 0.4), 0 0 24px hsl(328 100% 50% / 0.2)" },
    purple: { border: "hsl(270 100% 60%)", glow: "neon-icon-simple-purple", icon: "hsl(270 100% 60%)", shadow: "0 0 12px hsl(270 100% 60% / 0.4), 0 0 24px hsl(270 100% 60% / 0.2)" },
    green: { border: "hsl(120 100% 50%)", glow: "neon-icon-simple-green", icon: "hsl(120 100% 50%)", shadow: "0 0 12px hsl(120 100% 50% / 0.4), 0 0 24px hsl(120 100% 50% / 0.2)" },
    yellow: { border: "hsl(45 100% 50%)", glow: "neon-icon-simple-yellow", icon: "hsl(45 100% 50%)", shadow: "0 0 12px hsl(45 100% 50% / 0.4), 0 0 24px hsl(45 100% 50% / 0.2)" },
  };

  const colors = colorMap[feature.glowColor] || colorMap.cyan;

  const card = (
    <div
      className="group cursor-pointer flex flex-col items-center justify-center gap-3 w-40 h-40 transition-all duration-150"
      style={{
        borderRadius: "0",
        border: `2px solid ${colors.border}`,
        backgroundColor: "hsl(248 55% 14% / 0.7)",
        boxShadow: `inset 0 0 0 1px ${colors.border}40, inset 1px 1px 2px ${colors.border}30, inset -1px -1px 2px hsl(0 0% 0% / 0.9), ${colors.shadow}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${colors.border}80, inset 1px 1px 3px ${colors.border}50, inset -1px -1px 3px hsl(0 0% 0% / 0.95), 0 0 16px ${colors.border}60, 0 0 32px ${colors.border}40`;
        e.currentTarget.style.borderColor = `${colors.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${colors.border}40, inset 1px 1px 2px ${colors.border}30, inset -1px -1px 2px hsl(0 0% 0% / 0.9), ${colors.shadow}`;
        e.currentTarget.style.borderColor = `${colors.border}`;
      }}
      data-testid={`card-feature-${feature.id}`}
    >
      <IconComponent 
        className={`w-14 h-14 ${colors.glow} transition-transform duration-150 group-hover:scale-110`}
        style={{ color: colors.icon }}
        strokeWidth={2}
      />
      <h3 className="text-sm font-bold text-center leading-snug text-foreground" style={{ maxWidth: "140px" }}>
        {feature.title}
      </h3>
    </div>
  );

  if (feature.external) {
    return (
      <a href={feature.route} target="_blank" rel="noopener noreferrer">
        {card}
      </a>
    );
  }

  return <Link href={feature.route}>{card}</Link>;
}

export default function Hub() {
  const { language } = useAppContext();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const message = inputValue;
    setInputValue("");
    // Navigate immediately with the message, don't wait for AI response
    setLocation(`/chat?initialMessage=${encodeURIComponent(message)}`);
  };
  
  const features: FeatureCard[] = featureKeys.map(key => ({
    id: key.id,
    title: t(key.titleKey, language),
    description: "",
    icon: key.icon as any,
    route: key.route,
    glowColor: key.glowColor as any,
    position: "top-left",
    external: key.external,
  }));

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
          <div className="text-center mb-12">
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex items-center gap-2 bg-card rounded-full pl-5 pr-2 py-2 border border-primary/40 shadow-lg">
                <Input
                  placeholder={t("hub.chat.input", language)}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="border-0 bg-transparent placeholder:text-muted-foreground/50 !ring-0 !outline-none focus-visible:!ring-0 focus-visible:!outline-none focus:!ring-0 focus:!outline-none ring-offset-0 focus-visible:ring-offset-0 flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  data-testid="button-send-hub"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 text-foreground ${language === "ar" ? "text-lg font-semibold" : ""}`}>
              {t("hub.select", language)}
            </h2>
            <p className={`text-base text-muted-foreground ${language === "ar" ? "text-lg font-semibold" : ""}`}>
              {t("hub.description", language)}
            </p>
          </div>

          <div 
            className="flex flex-wrap justify-center items-center gap-8"
            data-testid="feature-grid"
            style={{ maxWidth: "1000px", margin: "0 auto" }}
          >
            {features.map((feature) => (
              <FeatureCardComponent key={feature.id} feature={feature} />
            ))}
          </div>

        </main>
      </div>
    </div>
  );
}
