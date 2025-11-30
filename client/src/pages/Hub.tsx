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
        <main className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-8">
          {/* Embossed Pharaonic/Ottoman Text-Only Info Hub with Animated Neon Border */}
          <div className="animated-neon-border mx-auto max-w-4xl">
            <div className="text-center space-y-4">
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold"
                style={{ 
                  fontFamily: "'Lateef', serif",
                  color: "#00F0FF",
                  textShadow: `
                    0 0 20px rgba(0, 240, 255, 0.8),
                    0 0 40px rgba(0, 240, 255, 0.6),
                    0 0 60px rgba(0, 240, 255, 0.4),
                    2px 2px 4px rgba(0, 0, 0, 0.8)
                  `,
                  letterSpacing: "0.05em",
                  filter: "drop-shadow(3px 3px 6px rgba(0, 0, 0, 0.9))",
                }}
                data-testid="info-hub-pharaonic-text"
              >
                {language === "ar" ? "مرحباً بك في HUMATA AI" : "Welcome to HUMATA AI"}
              </h2>
              
              <p 
                className="text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto"
                style={{ 
                  fontFamily: "'Lateef', serif",
                  color: "#00F0FF",
                  textShadow: `
                    0 0 15px rgba(0, 240, 255, 0.7),
                    0 0 30px rgba(0, 240, 255, 0.5),
                    1px 1px 3px rgba(0, 0, 0, 0.7)
                  `,
                  filter: "drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.8))",
                }}
              >
                {language === "ar" 
                  ? "نظام ذكاء اصطناعي متقدم يجمع بين 9 تخصصات متميزة: الدردشة الحرة، البحث العميق، الاستشارات الطبية، المساعد العلمي، توليد الصور، الاختبارات التفاعلية والمزيد."
                  : "An advanced AI system combining 9 specialized domains: Free Chat, Deep Research, Medical Consultation, Scientific Assistant, Image Generation, Interactive Quizzes, and more."
                }
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
              <span 
                className="text-sm px-4 py-2 rounded-full border border-cyan-500/50"
                style={{
                  fontFamily: "'Lateef', serif",
                  color: "#00F0FF",
                  backgroundColor: "rgba(0, 240, 255, 0.1)",
                  textShadow: `0 0 10px rgba(0, 240, 255, 0.6), 1px 1px 2px rgba(0, 0, 0, 0.5)`,
                }}
              >
                {language === "ar" ? "📁 رؤية الملفات" : "📁 File Vision"}
              </span>
              <span 
                className="text-sm px-4 py-2 rounded-full border border-magenta-500/50"
                style={{
                  fontFamily: "'Lateef', serif",
                  color: "#FF006E",
                  backgroundColor: "rgba(255, 0, 110, 0.1)",
                  textShadow: `0 0 10px rgba(255, 0, 110, 0.6), 1px 1px 2px rgba(0, 0, 0, 0.5)`,
                }}
              >
                {language === "ar" ? "🤖 ذكاء متخصص" : "🤖 Specialist AI"}
              </span>
              <span 
                className="text-sm px-4 py-2 rounded-full border border-purple-500/50"
                style={{
                  fontFamily: "'Lateef', serif",
                  color: "#B366FF",
                  backgroundColor: "rgba(179, 102, 255, 0.1)",
                  textShadow: `0 0 10px rgba(179, 102, 255, 0.6), 1px 1px 2px rgba(0, 0, 0, 0.5)`,
                }}
              >
                {language === "ar" ? "⚡ سريع وفعال" : "⚡ Fast & Efficient"}
              </span>
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
      </div>
    </div>
  );
}
