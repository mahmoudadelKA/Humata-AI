import { Link } from "wouter";
import { MessageSquare, Brain, Stethoscope, Eye, FileText, Zap, Lightbulb, Cpu, Rss } from "lucide-react";
import type { FeatureCard } from "@shared/schema";

const features: FeatureCard[] = [
  // Top row
  {
    id: "chat",
    title: "الحدثة",
    description: "محادثة ذكية مع الذكاء الاصطناعي المتقدم",
    icon: "MessageSquare",
    route: "/chat",
    glowColor: "cyan",
    position: "top-left",
  },
  {
    id: "quick",
    title: "أسال",
    description: "أسئلة وأجوبة سريعة وفورية",
    icon: "Lightbulb",
    route: "/chat?mode=quick",
    glowColor: "cyan",
    position: "top-center",
  },
  {
    id: "docs",
    title: "البحث العلمي",
    description: "تحليل البحوث والمستندات العلمية",
    icon: "FileText",
    route: "/chat?mode=docs",
    glowColor: "purple",
    position: "top-right",
  },
  // Middle row
  {
    id: "doctor",
    title: "الاختبارات",
    description: "اختبارات وتحليل متقدم",
    icon: "Stethoscope",
    route: "/chat?persona=doctor",
    glowColor: "magenta",
    position: "middle-left",
  },
  {
    id: "vision",
    title: "توليد الصور",
    description: "تحليل وتوليد الصور بتقنية الذكاء الاصطناعي",
    icon: "Eye",
    route: "/chat?mode=vision",
    glowColor: "magenta",
    position: "middle-right",
  },
  // Bottom row
  {
    id: "assistant",
    title: "المساعد العلمي",
    description: "مساعد ذكي للأبحاث العلمية",
    icon: "Cpu",
    route: "/chat?mode=assistant",
    glowColor: "green",
    position: "bottom-left",
  },
  {
    id: "khedive",
    title: "الخديوي",
    description: "مستشار استراتيجي متقدم",
    icon: "Brain",
    route: "/chat?persona=khedive",
    glowColor: "yellow",
    position: "bottom-center",
  },
  {
    id: "sync",
    title: "التزامن",
    description: "مزامنة سريعة للبيانات والإجابات",
    icon: "Rss",
    route: "/chat?mode=sync",
    glowColor: "cyan",
    position: "bottom-right",
  },
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
  
  const colorMap = {
    cyan: { border: "hsl(180 100% 50%)", icon: "hsl(180,100%,50%)", glow: "neon-icon-simple-cyan" },
    magenta: { border: "hsl(328 100% 50%)", icon: "hsl(328,100%,50%)", glow: "neon-icon-simple-magenta" },
    purple: { border: "hsl(270 100% 60%)", icon: "hsl(270,100%,60%)", glow: "neon-icon-simple-purple" },
    green: { border: "hsl(120 100% 50%)", icon: "hsl(120,100%,50%)", glow: "neon-icon-simple-green" },
    yellow: { border: "hsl(45 100% 50%)", icon: "hsl(45,100%,50%)", glow: "neon-icon-simple-yellow" },
  }[feature.glowColor];

  return (
    <Link href={feature.route}>
      <div
        className="group cursor-pointer flex flex-col items-center justify-center gap-1 w-20 h-20 transition-all duration-150"
        style={{
          borderRadius: "0",
          border: `2px solid ${colorMap.border}80`,
          backgroundColor: "hsl(248 55% 14% / 0.6)",
          boxShadow: `inset 0 0 0 1px ${colorMap.border}40, inset 1px 1px 2px ${colorMap.border}20, inset -1px -1px 2px hsl(0 0% 0% / 0.8), 0 0 3px ${colorMap.border}30, 0 0 6px ${colorMap.border}15`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${colorMap.border}`;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${colorMap.border}80, inset 1px 1px 3px ${colorMap.border}40, inset -1px -1px 3px hsl(0 0% 0% / 0.9), 0 0 6px ${colorMap.border}60, 0 0 12px ${colorMap.border}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = `${colorMap.border}80`;
          e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${colorMap.border}40, inset 1px 1px 2px ${colorMap.border}20, inset -1px -1px 2px hsl(0 0% 0% / 0.8), 0 0 3px ${colorMap.border}30, 0 0 6px ${colorMap.border}15`;
        }}
        data-testid={`card-feature-${feature.id}`}
      >
        <IconComponent 
          className={`w-6 h-6 ${colorMap.glow} transition-transform duration-150 group-hover:scale-110`}
          style={{ color: colorMap.icon }}
          strokeWidth={1.5}
        />
        <h3 className="text-[9px] font-bold text-center leading-tight text-foreground overflow-hidden">
          {feature.title}
        </h3>
      </div>
    </Link>
  );
}

export default function Hub() {
  return (
    <div className="min-h-screen bg-background cyber-grid" dir="rtl">
      <div className="relative z-10">
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 rounded border border-primary/30 bg-primary/5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-muted-foreground">النظام نشط</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    مركز الذكاء الاصطناعي
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    جيميني 2.5 برو
                  </p>
                </div>
                <div className="w-8 h-8 rounded border border-primary/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8" dir="rtl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              اختر الواجهة
            </h2>
            <p className="text-sm text-muted-foreground">
              وحدات الذكاء الاصطناعي المتقدمة
            </p>
          </div>

          <div 
            className="flex flex-wrap justify-center items-start gap-3"
            data-testid="feature-grid"
            style={{ maxWidth: "400px", margin: "0 auto" }}
          >
            {features.map((feature) => (
              <FeatureCardComponent key={feature.id} feature={feature} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground border border-border/30 rounded">
              <span>مدعوم من</span>
              <span className="font-semibold">جيميني 2.5</span>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/30 mt-8 py-4">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-xs text-muted-foreground/50">
              نظام الواجهة العصبية
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
