import { Link } from "wouter";
import { MessageSquare, Brain, Stethoscope, Eye, FileText, Zap, Lightbulb, Cpu, Rss } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import type { FeatureCard } from "@shared/schema";

const featureKeys = [
  { id: "chat", titleKey: "feature.chat", icon: "MessageSquare", route: "/chat", glowColor: "cyan" },
  { id: "quick", titleKey: "feature.quick", icon: "Lightbulb", route: "/chat?mode=quick", glowColor: "cyan" },
  { id: "docs", titleKey: "feature.docs", icon: "FileText", route: "/chat?mode=docs", glowColor: "purple" },
  { id: "doctor", titleKey: "feature.tests", icon: "Stethoscope", route: "/chat?persona=doctor", glowColor: "magenta" },
  { id: "vision", titleKey: "feature.image", icon: "Eye", route: "/chat?mode=vision", glowColor: "magenta" },
  { id: "assistant", titleKey: "feature.assistant", icon: "Cpu", route: "/chat?mode=assistant", glowColor: "green" },
  { id: "khedive", titleKey: "feature.khedive", icon: "Brain", route: "/chat?persona=khedive", glowColor: "yellow" },
  { id: "sync", titleKey: "feature.sync", icon: "Rss", route: "/chat?mode=sync", glowColor: "cyan" },
];

const iconMap: Record<string, typeof MessageSquare> = {
  MessageSquare,
  Brain,
  Stethoscope,
  Eye,
  FileText,
  Zap,
  Lightbulb,
  Cpu,
  Rss,
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

  return (
    <Link href={feature.route}>
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
    </Link>
  );
}

export default function Hub() {
  const { language } = useAppContext();
  
  const features: FeatureCard[] = featureKeys.map(key => ({
    id: key.id,
    title: t(key.titleKey, language),
    description: "",
    icon: key.icon as any,
    route: key.route,
    glowColor: key.glowColor as any,
    position: "top-left",
  }));

  return (
    <div className="min-h-screen bg-background cyber-grid" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="relative z-10">
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded border border-primary/30 bg-primary/5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className={`text-xs text-muted-foreground ${language === "ar" ? "font-bold" : ""}`}>{t("system.active", language)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className={`text-xl font-bold text-foreground ${language === "ar" ? "text-2xl" : ""}`}>
                    {t("hub.title", language)}
                  </h1>
                  <p className={`text-xs text-muted-foreground ${language === "ar" ? "text-sm" : ""}`}>
                    {t("hub.subtitle", language)}
                  </p>
                </div>
                <div className="w-8 h-8 rounded border border-primary/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold mb-4 text-foreground ${language === "ar" ? "text-5xl" : ""}`}>
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

          <div className="mt-12 text-center">
            <div className={`inline-flex items-center gap-3 px-5 py-3 text-sm text-muted-foreground border border-border/30 rounded ${language === "ar" ? "text-base font-bold" : ""}`}>
              <span>{t("hub.powered", language)}</span>
              <span className="font-semibold">{t("hub.gemini", language)}</span>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/30 mt-12 py-6">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className={`text-sm text-muted-foreground/50 ${language === "ar" ? "text-base" : ""}`}>
              {t("hub.system", language)}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
