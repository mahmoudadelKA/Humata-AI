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
  
  const glowClass = {
    cyan: "embedded-panel embedded-panel-cyan group",
    magenta: "embedded-panel embedded-panel-magenta group",
    purple: "embedded-panel embedded-panel-purple group",
    green: "embedded-panel embedded-panel-green group",
    yellow: "embedded-panel embedded-panel-yellow group",
  }[feature.glowColor];

  const iconGlow = {
    cyan: "text-[hsl(180,100%,50%)] neon-icon-heavy-cyan",
    magenta: "text-[hsl(328,100%,50%)] neon-icon-heavy-magenta",
    purple: "text-[hsl(270,100%,60%)] neon-icon-heavy-purple",
    green: "text-[hsl(120,100%,50%)] neon-icon-heavy-green",
    yellow: "text-[hsl(45,100%,50%)] neon-icon-heavy-yellow",
  }[feature.glowColor];

  return (
    <Link href={feature.route}>
      <div
        className={`${glowClass} p-6 cursor-pointer h-full flex flex-col aspect-square`}
        data-testid={`card-feature-${feature.id}`}
      >
        <div className="mb-6 flex items-center justify-center">
          <IconComponent 
            className={`w-16 h-16 ${iconGlow} transition-all duration-300 group-hover:scale-105`} 
            strokeWidth={2.5}
          />
        </div>
        <h3 className="text-lg font-bold mb-2 tracking-wider text-foreground text-center">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed flex-1 text-center">
          {feature.description}
        </p>
        <div className="mt-auto flex items-center justify-center gap-2 text-xs text-muted-foreground/70 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>نشط</span>
        </div>
      </div>
    </Link>
  );
}

export default function Hub() {
  const topRowFeatures = features.filter(f => f.position?.startsWith("top"));
  const middleRowFeatures = features.filter(f => f.position?.startsWith("middle"));
  const bottomRowFeatures = features.filter(f => f.position?.startsWith("bottom"));

  return (
    <div className="min-h-screen bg-background cyber-grid" dir="rtl">
      <div className="relative z-10">
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/30 bg-primary/5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground tracking-wider">النظام نشط</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-wider text-glow-cyan text-foreground">
                    مركز الذكاء الاصطناعي
                  </h1>
                  <p className="text-xs text-muted-foreground tracking-widest">
                    جيميني فيجن كونسول v3.0
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center neon-glow-cyan">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12" dir="rtl">
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-glow-cyan">
              <span className="text-foreground">اختر </span>
              <span className="text-glow-cyan text-primary">الواجهة</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              وصول متقدم إلى إمكانيات الذكاء الاصطناعي عبر شبكة عصبية سيبرنية. اختر الوحدة لتبدأ.
            </p>
          </div>

          {/* Top Row */}
          <div className="grid grid-cols-3 gap-6 mb-6" data-testid="feature-grid-top">
            {topRowFeatures.map((feature) => (
              <FeatureCardComponent key={feature.id} feature={feature} />
            ))}
          </div>

          {/* Middle Row with Center Showcase */}
          <div className="grid grid-cols-12 gap-6 mb-6">
            {/* Left Card */}
            <div className="col-span-2 row-span-2 flex items-stretch">
              {middleRowFeatures[0] && (
                <FeatureCardComponent feature={middleRowFeatures[0]} />
              )}
            </div>

            {/* Center Showcase Panel */}
            <div className="col-span-8 row-span-2">
              <div className="embedded-panel embedded-panel-showcase h-full min-h-80 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyan-500 via-purple-500 to-magenta-500 animate-pulse" />
                <div className="relative z-10 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 neon-glow-cyan">
                      <Cpu className="w-12 h-12 text-primary neon-icon-heavy-cyan" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">واجهة التحكم المركزية</h3>
                  <p className="text-muted-foreground text-sm mb-6 max-w-md">
                    منصة متقدمة للتفاعل مع الذكاء الاصطناعي. اختر أي وحدة من الخيارات حول هذه الواجهة للبدء.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>متصل وجاهز</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="col-span-2 row-span-2 flex items-stretch">
              {middleRowFeatures[1] && (
                <FeatureCardComponent feature={middleRowFeatures[1]} />
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-3 gap-6" data-testid="feature-grid-bottom">
            {bottomRowFeatures.map((feature) => (
              <FeatureCardComponent key={feature.id} feature={feature} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg border border-border/30 bg-card/30">
              <span className="text-xs text-muted-foreground tracking-wider">مدعوم من قبل</span>
              <span className="text-sm font-semibold text-foreground tracking-wider">جيميني 2.5 برو</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </main>

        <footer className="border-t border-border/30 mt-16 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs text-muted-foreground/50 tracking-widest">
              نظام الواجهة العصبية - جميع الحقوق محفوظة
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
