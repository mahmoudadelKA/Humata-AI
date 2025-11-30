import { useLocation } from "wouter";
import { MessageSquare, HelpCircle, BookOpen, Image, CheckCircle, Sparkles, Stethoscope, Users, Landmark, Sun, Moon, Globe, Map } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";

function FeatureCardComponent({ feature }: any) {
  const IconComponent = feature.icon;
  const [, navigate] = useLocation();
  
  const colorMap: Record<string, { icon: string; glow: string }> = {
    cyan: { icon: "#00F0FF", glow: "rgba(0, 240, 255, 0.6)" },
    magenta: { icon: "#FF006E", glow: "rgba(255, 0, 110, 0.6)" },
    green: { icon: "#00FF88", glow: "rgba(0, 255, 136, 0.6)" },
    yellow: { icon: "#FFD700", glow: "rgba(255, 215, 0, 0.6)" },
  };

  const colors = colorMap[feature.glowColor] || colorMap.cyan;

  return (
    <div
      onClick={() => navigate(feature.route)}
      className="group cursor-pointer flex flex-col items-center justify-center gap-4 animate-fade-in-up icon-3d-container"
      style={{ animationDelay: feature.delay }}
      data-testid={`card-feature-${feature.id}`}
    >
      <div className="icon-3d-wrapper" style={{ "--icon-glow": colors.glow } as React.CSSProperties}>
        <IconComponent 
          className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 icon-3d"
          style={{ color: colors.icon }}
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-center leading-snug" style={{ color: colors.icon, maxWidth: "120px", textShadow: `0 0 10px ${colors.glow}` }}>
        {feature.title}
      </h3>
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
    { id: "geographer", titleKey: "feature.geographer", descKey: "feature.geographer.desc", icon: Map, route: "/chat?persona=geographer", glowColor: "magenta" },
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
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="animated-neon-border">
            <div className="text-center space-y-4">
              <h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold"
                style={{ 
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
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
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
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
                  ? "نظام ذكاء اصطناعي متقدم يجمع بين 10 تخصصات متميزة: الدردشة الحرة، البحث العلمي، الاستشارات الطبية، المساعد العلمي، توليد الصور، الاختبارات التفاعلية، صور ذكاء اصطناعي، الخديوي، المعلم الجغرافي والمزيد."
                  : "An advanced AI system combining 10 specialized domains: Free Chat, Research, Medical Consultation, Scientific Assistant, Image Generation, Interactive Quizzes, AI Image Generation, Khedive, Geographer, and more."
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

          <div className="mt-16 sm:mt-20 md:mt-24 mb-8 px-3 flex justify-center">
            <p className="inspirational-quote text-center max-w-2xl" style={{ fontFamily: "'Lateef', serif" }}>
              {language === "ar" 
                ? "إذا لم تحاول أن تفعل شيئاً أبعد ممّا قد أتقنته.. فإنك لا تتقدم أبداً"
                : "If you don't attempt something beyond what you have already mastered.. you will never progress"
              }
            </p>
          </div>

        </main>

        {/* Footer - Programmer Credit */}
        <footer className="mt-auto py-8 px-3 text-center border-t border-foreground/10">
          <p 
            className="text-base sm:text-lg text-foreground/70 animate-neon-glow"
            style={{ 
              fontFamily: "'Cairo', sans-serif", 
              fontWeight: 600,
              textShadow: `
                0 0 10px rgba(0, 240, 255, 0.5),
                0 0 20px rgba(0, 240, 255, 0.3),
                0 0 30px rgba(255, 0, 110, 0.3),
                0 0 40px rgba(0, 240, 255, 0.2)
              `,
              animation: "neon-flicker 3s infinite"
            }}
          >
            {language === "ar" 
              ? "تمت برمجة هذا الموقع من قبل المبرمج محمود عادل"
              : "This website was programmed by Mahmoud Adel"
            }
          </p>
        </footer>
      </div>
    </div>
  );
}
