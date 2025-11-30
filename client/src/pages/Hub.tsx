import { useLocation } from "wouter";
import { MessageSquare, HelpCircle, BookOpen, Image, CheckCircle, Sparkles, Stethoscope, Users, Landmark, Sun, Moon, Globe } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";

function FeatureCardComponent({ feature }: any) {
  const IconComponent = feature.icon;
  const [, navigate] = useLocation();
  
  const colorMap: Record<string, { border: string; shadow: string; icon: string }> = {
    cyan: { border: "hsl(180 100% 50%)", icon: "hsl(180 100% 50%)", shadow: "0 0 12px hsl(180 100% 50% / 0.4), 0 0 24px hsl(180 100% 50% / 0.2)" },
    magenta: { border: "hsl(328 100% 50%)", icon: "hsl(328 100% 50%)", shadow: "0 0 12px hsl(328 100% 50% / 0.4), 0 0 24px hsl(328 100% 50% / 0.2)" },
    green: { border: "hsl(120 100% 50%)", icon: "hsl(120 100% 50%)", shadow: "0 0 12px hsl(120 100% 50% / 0.4), 0 0 24px hsl(120 100% 50% / 0.2)" },
    yellow: { border: "hsl(60 100% 50%)", icon: "hsl(60 100% 50%)", shadow: "0 0 12px hsl(60 100% 50% / 0.4), 0 0 24px hsl(60 100% 50% / 0.2)" },
  };

  const colors = colorMap[feature.glowColor] || colorMap.cyan;

  return (
    <div
      onClick={() => navigate(feature.route)}
      className="group cursor-pointer flex flex-col items-center justify-center gap-3 w-40 h-40 sm:w-40 sm:h-40 md:w-48 md:h-48 smooth-hover animate-fade-in-up backdrop-blur-md"
      style={{
        borderRadius: "12px",
        border: `1.5px solid ${colors.border}`,
        backgroundColor: "rgba(248, 113, 113, 0.08)",
        backdropFilter: "blur(10px)",
        boxShadow: `0 0 20px ${colors.border}40, inset 0 1px 1px rgba(255, 255, 255, 0.1)`,
        animationDelay: feature.delay,
      }}
      onMouseEnter={(e) => {
        if (window.innerWidth >= 768) {
          e.currentTarget.style.boxShadow = `0 0 30px ${colors.border}70, inset 0 1px 1px rgba(255, 255, 255, 0.15)`;
          e.currentTarget.style.borderColor = `${colors.border}`;
          e.currentTarget.style.transform = "scale(1.05)";
        }
      }}
      onMouseLeave={(e) => {
        if (window.innerWidth >= 768) {
          e.currentTarget.style.boxShadow = `0 0 20px ${colors.border}40, inset 0 1px 1px rgba(255, 255, 255, 0.1)`;
          e.currentTarget.style.borderColor = `${colors.border}`;
          e.currentTarget.style.transform = "scale(1)";
        }
      }}
      data-testid={`card-feature-${feature.id}`}
    >
      <IconComponent 
        className="w-14 h-14 transition-transform duration-150 group-hover:scale-110"
        style={{ color: colors.icon }}
        strokeWidth={2}
      />
      <div className="flex flex-col items-center justify-center gap-1 px-3">
        <h3 className="text-sm font-bold text-center leading-snug text-foreground" style={{ maxWidth: "140px" }}>
          {feature.title}
        </h3>
        <p className="text-xs text-muted-foreground text-center leading-tight" style={{ maxWidth: "135px" }}>
          {feature.description}
        </p>
      </div>
    </div>
  );
}

export default function Hub() {
  const { language, theme, setLanguage, setTheme } = useAppContext();
  const [, setLocation] = useLocation();

  const featureKeys = [
    { id: "chat", titleKey: "feature.chat", descKey: "feature.chat.desc", icon: MessageSquare, route: "/chat", glowColor: "cyan" },
    { id: "ask", titleKey: "feature.ask", descKey: "feature.ask.desc", icon: HelpCircle, route: "/chat?persona=ask", glowColor: "magenta" },
    { id: "research", titleKey: "feature.research", descKey: "feature.research.desc", icon: BookOpen, route: "/chat?persona=research", glowColor: "green" },
    { id: "images", titleKey: "feature.images", descKey: "feature.images.desc", icon: Image, route: "/chat?persona=google-images", glowColor: "yellow" },
    { id: "quizzes", titleKey: "feature.quizzes", descKey: "feature.quizzes.desc", icon: CheckCircle, route: "/chat?persona=quizzes", glowColor: "cyan" },
    { id: "ai-images", titleKey: "feature.ai-images", descKey: "feature.ai-images.desc", icon: Sparkles, route: "/chat?persona=ai-images", glowColor: "magenta" },
    { id: "doctor", titleKey: "feature.doctor", descKey: "feature.doctor.desc", icon: Stethoscope, route: "/chat?persona=doctor", glowColor: "green" },
    { id: "scientific-assistant", titleKey: "feature.scientific-assistant", descKey: "feature.scientific-assistant.desc", icon: Users, route: "/chat?persona=scientific-assistant", glowColor: "cyan" },
    { id: "khedive", titleKey: "feature.khedive", descKey: "feature.khedive.desc", icon: Landmark, route: "/chat?persona=khedive", glowColor: "yellow" },
  ];

  const features = featureKeys.map((key, index) => ({
    id: key.id,
    title: t(key.titleKey, language),
    description: t(key.descKey, language),
    icon: key.icon,
    route: key.route,
    glowColor: key.glowColor,
    delay: `${index * 0.08}s`,
  }));

  return (
    <div className="min-h-screen relative" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="relative z-10 hub-with-animated-bg">
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50 px-2 sm:px-4 md:px-6">
          <div className="max-w-6xl mx-auto py-3 sm:py-4">
            <div className="flex items-center justify-center flex-col gap-1">
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-primary ${language === "ar" ? "text-2xl sm:text-3xl" : ""}`}>
                HUMATA AI
              </h1>
              <p className={`text-xs sm:text-sm text-muted-foreground/70 ${language === "ar" ? "text-xs sm:text-sm font-bold" : ""}`}>
                {t("hub.system", language)}
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          {/* Oval Glassmorphism Info Hub */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="max-w-4xl mx-auto mb-8 sm:mb-12 px-2">
              <div 
                className="relative px-8 sm:px-12 py-8 sm:py-10 smooth-transition backdrop-blur-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "50% / 35%",
                  border: "1.5px solid rgba(0, 240, 255, 0.3)",
                  boxShadow: `0 8px 32px rgba(0, 240, 255, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 0 40px rgba(0, 240, 255, 0.1)`,
                  backdropFilter: "blur(10px)",
                }}
                data-testid="info-hub-oval-glass"
              >
                <div className="relative z-10 space-y-3">
                  <h2 className="text-2xl sm:text-3xl font-bold" style={{ 
                    color: "#00F0FF", 
                    textShadow: "0 0 15px rgba(0, 240, 255, 0.8), 0 0 25px rgba(0, 240, 255, 0.5)"
                  }}>
                    {language === "ar" ? "مرحباً بك في HUMATA AI" : "Welcome to HUMATA AI"}
                  </h2>
                  
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-3xl mx-auto">
                    {language === "ar" 
                      ? "تجربة ذكاء اصطناعي متقدمة مع 9 تخصصات متميزة: دردشة، بحث، استشارات طبية، مساعد علمي، توليد صور، اختبارات تفاعلية وأكثر."
                      : "Advanced AI with 9 specialized modules: Chat, Research, Medical, Science, Image Generation, Quizzes, and more."
                    }
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {language === "ar" ? "📁 رؤية الملفات" : "📁 File Vision"}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-magenta-500/20 text-magenta-300 border border-magenta-500/30">
                      {language === "ar" ? "🤖 ذكاء متخصص" : "🤖 Specialist AI"}
                    </span>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {language === "ar" ? "⚡ سريع" : "⚡ Fast"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-8 sm:mb-12 md:mb-16 px-3">
            <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-4 ${language === "ar" ? "text-lg sm:text-xl md:text-2xl animated-dua" : "text-foreground"}`}>
              {t("hub.select", language)}
            </h2>
          </div>

          <div 
            className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 md:gap-8 px-3"
            data-testid="feature-grid"
            style={{ maxWidth: "1000px", margin: "0 auto" }}
          >
            {features.map((feature) => (
              <FeatureCardComponent key={feature.id} feature={feature} />
            ))}
          </div>

        </main>

        {/* Left-Bottom Controls - Hub Only */}
        <div className="fixed bottom-8 left-8 z-40">
          <div className={`flex items-center gap-3 bg-muted/40 border border-border/50 rounded-full px-5 py-3 backdrop-blur-md hover:bg-muted/60 transition-all ${language === "ar" ? "flex-row-reverse" : ""}`}>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              data-testid="button-theme-toggle-hub"
              className="h-8 w-8 rounded-lg hover:bg-primary/10"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-primary" />
              ) : (
                <Moon className="w-4 h-4 text-primary" />
              )}
            </Button>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
              data-testid="button-language-toggle-hub"
              className="h-8 w-8 rounded-lg hover:bg-accent/10 flex items-center justify-center gap-1"
              title={language === "ar" ? "English" : "العربية"}
            >
              <Globe className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-bold text-accent">{language.toUpperCase()}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
