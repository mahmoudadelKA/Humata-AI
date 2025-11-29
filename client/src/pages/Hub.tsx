import { Link } from "wouter";
import { MessageSquare, Brain, Stethoscope, Eye, FileText, Zap } from "lucide-react";
import type { FeatureCard } from "@shared/schema";

const features: FeatureCard[] = [
  {
    id: "chat",
    title: "NEURAL CHAT",
    description: "Engage with advanced AI in real-time conversation. Experience next-gen language processing.",
    icon: "MessageSquare",
    route: "/chat",
    glowColor: "cyan",
  },
  {
    id: "vision",
    title: "VISION CORE",
    description: "Upload images for instant AI analysis. Unlock the power of computer vision.",
    icon: "Eye",
    route: "/chat?mode=vision",
    glowColor: "magenta",
  },
  {
    id: "docs",
    title: "DOC SCANNER",
    description: "Parse PDFs and documents with precision. Extract insights from any file.",
    icon: "FileText",
    route: "/chat?mode=docs",
    glowColor: "purple",
  },
  {
    id: "khedive",
    title: "KHEDIVE AI",
    description: "Your strategic advisor powered by advanced reasoning. Navigate complex decisions.",
    icon: "Brain",
    route: "/chat?persona=khedive",
    glowColor: "cyan",
  },
  {
    id: "doctor",
    title: "MED CONSUL",
    description: "Medical information assistant. Get health insights with AI precision.",
    icon: "Stethoscope",
    route: "/chat?persona=doctor",
    glowColor: "magenta",
  },
  {
    id: "quick",
    title: "QUICK SYNC",
    description: "Rapid-fire Q&A mode. Get instant answers at lightning speed.",
    icon: "Zap",
    route: "/chat?mode=quick",
    glowColor: "purple",
  },
];

const iconMap: Record<string, typeof MessageSquare> = {
  MessageSquare,
  Brain,
  Stethoscope,
  Eye,
  FileText,
  Zap,
};

function FeatureCardComponent({ feature }: { feature: FeatureCard }) {
  const IconComponent = iconMap[feature.icon];
  
  const glowClass = {
    cyan: "neon-card group",
    magenta: "neon-card-magenta group",
    purple: "neon-card group",
  }[feature.glowColor];

  const iconGlow = {
    cyan: "text-[hsl(180,100%,50%)] text-glow-cyan",
    magenta: "text-[hsl(328,100%,50%)] text-glow-magenta",
    purple: "text-[hsl(270,100%,60%)] text-glow-cyan",
  }[feature.glowColor];

  return (
    <Link href={feature.route}>
      <div
        className={`${glowClass} rounded-lg p-8 cursor-pointer h-full flex flex-col`}
        data-testid={`card-feature-${feature.id}`}
      >
        <div className="mb-6">
          <IconComponent 
            className={`w-12 h-12 ${iconGlow} icon-glow-3d ${feature.glowColor === 'magenta' ? 'magenta' : feature.glowColor === 'purple' ? 'purple' : ''} transition-all duration-300 group-hover:scale-110`} 
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-xl font-bold mb-3 tracking-wider text-foreground">
          {feature.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed flex-1">
          {feature.description}
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/70 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          <span>ONLINE</span>
        </div>
      </div>
    </Link>
  );
}

export default function Hub() {
  return (
    <div className="min-h-screen bg-background cyber-grid" dir="auto">
      <div className="relative z-10">
        <header className="border-b border-border/30 backdrop-blur-sm bg-background/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between gap-4 rtl:flex-row-reverse">
              <div className="flex items-center gap-4 rtl:flex-row-reverse">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center neon-glow-cyan">
                  <Zap className="w-5 h-5 text-primary icon-glow-3d" />
                </div>
                <div dir="auto">
                  <h1 className="text-2xl font-bold tracking-wider text-glow-cyan text-foreground">
                    NEON AI HUB
                  </h1>
                  <p className="text-xs text-muted-foreground tracking-widest uppercase">
                    Gemini Vision Console v3.0
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rtl:flex-row-reverse">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-primary/30 bg-primary/5 rtl:flex-row-reverse">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground tracking-wider">SYSTEM ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-16" dir="auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-glow-cyan">
              <span className="text-foreground">SELECT </span>
              <span className="text-glow-cyan text-primary">INTERFACE</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Access advanced AI capabilities through our cybernetic neural network. 
              Choose your module to begin.
            </p>
          </div>

          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            data-testid="feature-grid"
          >
            {features.map((feature) => (
              <FeatureCardComponent key={feature.id} feature={feature} />
            ))}
          </div>

          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg border border-border/30 bg-card/30">
              <span className="text-xs text-muted-foreground tracking-wider">POWERED BY</span>
              <span className="text-sm font-semibold text-foreground tracking-wider">GEMINI 3 PRO PREVIEW</span>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </main>

        <footer className="border-t border-border/30 mt-20 py-8">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-xs text-muted-foreground/50 tracking-widest uppercase">
              Neural Interface System // All Rights Reserved
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
