import { Link } from "wouter";
import { MessageSquare, HelpCircle, BookOpen, Image, CheckCircle, Sparkles, Stethoscope, Users, Landmark, Home } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";

interface ModuleNavigationProps {
  onNavigate?: () => void;
}

export function ModuleNavigation({ onNavigate }: ModuleNavigationProps) {
  const { language } = useAppContext();

  const modules = [
    { id: "home", titleKey: "feature.home", icon: Home, route: "/", color: "text-cyan-400" },
    { id: "chat", titleKey: "feature.chat", icon: MessageSquare, route: "/chat", color: "text-cyan-400" },
    { id: "ask", titleKey: "feature.ask", icon: HelpCircle, route: "/chat?persona=ask", color: "text-magenta-400" },
    { id: "research", titleKey: "feature.research", icon: BookOpen, route: "/chat?persona=research", color: "text-green-400" },
    { id: "images", titleKey: "feature.images", icon: Image, route: "/chat?persona=google-images", color: "text-yellow-400" },
    { id: "quizzes", titleKey: "feature.quizzes", icon: CheckCircle, route: "/chat?persona=quizzes", color: "text-cyan-400" },
    { id: "ai-images", titleKey: "feature.ai-images", icon: Sparkles, route: "/chat?persona=ai-images", color: "text-magenta-400" },
    { id: "doctor", titleKey: "feature.doctor", icon: Stethoscope, route: "/chat?persona=doctor", color: "text-green-400" },
    { id: "scientific", titleKey: "feature.scientific-assistant", icon: Users, route: "/chat?persona=scientific-assistant", color: "text-cyan-400" },
    { id: "khedive", titleKey: "feature.khedive", icon: Landmark, route: "/chat?persona=khedive", color: "text-yellow-400" },
  ];

  return (
    <div className={`w-64 border-r border-border/30 bg-gradient-to-b from-muted/40 to-background/20 flex flex-col ${language === "ar" ? "border-l border-r-0" : ""}`}>
      <div className="p-4 border-b border-border/30 space-y-2">
        <h3 className={`text-sm font-bold text-foreground ${language === "ar" ? "text-right" : ""}`}>
          {language === "ar" ? "الملاحة السريعة" : "Quick Navigation"}
        </h3>
      </div>

      <div className="space-y-1 p-2 flex-1 overflow-y-auto">
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Link key={module.id} href={module.route}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 h-auto py-2 px-3 text-sm hover:bg-primary/10 transition-colors"
                onClick={onNavigate}
                data-testid={`button-nav-${module.id}`}
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 ${module.color}`} />
                <span className="text-foreground/80 truncate">{t(module.titleKey, language)}</span>
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="border-t border-border/30 p-3 text-xs text-muted-foreground text-center">
        {language === "ar" ? "الملاحة الديناميكية للوحدات" : "Dynamic Module Navigation"}
      </div>
    </div>
  );
}
