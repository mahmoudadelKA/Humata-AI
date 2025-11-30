import { Link } from "wouter";
import { MessageSquare, HelpCircle, BookOpen, Image, CheckCircle, Sparkles, Stethoscope, Users, Landmark } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { useLocation } from "wouter";

export function FloatingNavBar() {
  const { language } = useAppContext();
  const [location] = useLocation();
  
  const getCurrentPersona = () => {
    const params = new URLSearchParams(location.split('?')[1]);
    return params.get('persona') || 'chat';
  };

  const modules = [
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

  const currentPersona = getCurrentPersona();

  return (
    <div 
      className="fixed hidden md:flex gap-3 p-4 rounded-3xl z-40 flex-row flex-wrap justify-center items-center transition-all duration-300"
      style={{
        top: "15%",
        left: "20px",
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(0, 240, 255, 0.2)",
        boxShadow: "0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(255, 0, 110, 0.1)",
        width: "auto",
        maxWidth: "80px"
      }}
    >
      {modules.map((module) => {
        const IconComponent = module.icon;
        const isActive = currentPersona === module.id || (module.id === 'chat' && currentPersona === '');
        
        return (
          <Link key={module.id} href={module.route}>
            <button
              title={t(module.titleKey, language)}
              className={`p-2.5 rounded-full transition-all duration-200 ${
                isActive
                  ? `${module.color} bg-white/20 shadow-lg`
                  : `text-foreground/60 hover:text-foreground hover:bg-white/10`
              }`}
              data-testid={`button-floating-nav-${module.id}`}
            >
              <IconComponent className="w-5 h-5" />
            </button>
          </Link>
        );
      })}
    </div>
  );
}
