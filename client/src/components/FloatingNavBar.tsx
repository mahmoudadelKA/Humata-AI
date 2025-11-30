import { useState } from "react";
import { useLocation } from "wouter";
import { Home, MessageSquare, HelpCircle, BookOpen, Image, CheckCircle, Sparkles, Stethoscope, Users, Landmark, ChevronUp, ChevronDown } from "lucide-react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";

export function FloatingNavBar() {
  const { language } = useAppContext();
  const [location, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const modules = [
    // HOME ICON - FIRST
    { id: "home", titleKey: "nav.home", icon: Home, route: "/", color: "text-cyan-400" },
    
    // ALL PERSONA ICONS
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

  const handleNavigate = (route: string) => {
    navigate(route);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="fixed flex flex-col gap-2 transition-all duration-300"
      style={{
        top: "15%",
        left: "20px",
        zIndex: 99999,
        pointerEvents: "auto"
      }}
    >
      {/* Toggle Button */}
      <button
        type="button"
        onClick={toggleExpand}
        className="p-3 rounded-full transition-all duration-200 backdrop-blur-lg hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          border: "1px solid rgba(0, 240, 255, 0.3)",
          boxShadow: "0 0 15px rgba(0, 240, 255, 0.4)",
          pointerEvents: "auto"
        }}
        title={isExpanded ? "Hide modules" : "Show modules"}
        data-testid="button-floating-nav-toggle"
      >
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-cyan-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-cyan-400" />
        )}
      </button>

      {/* Navigation Icons */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in fade-in-50 duration-200">
          {modules.map((module) => {
            const IconComponent = module.icon;
            const isActive = location === module.route || 
              (location === "/chat" && module.id === "chat") ||
              (location.includes("persona=") && location.includes(module.route.split("=")[1]));
            
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => handleNavigate(module.route)}
                title={t(module.titleKey, language)}
                className={`p-3 rounded-full transition-all duration-200 backdrop-blur-lg hover:scale-110 active:scale-95 cursor-pointer`}
                style={{
                  backgroundColor: isActive ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
                  border: isActive ? "2px solid" : "1px solid rgba(0, 240, 255, 0.2)",
                  borderColor: isActive ? "currentColor" : undefined,
                  boxShadow: isActive ? `0 0 15px ${
                    module.color === "text-cyan-400" ? "rgb(0, 240, 255)" :
                    module.color === "text-magenta-400" ? "rgb(255, 0, 110)" :
                    module.color === "text-green-400" ? "rgb(0, 240, 150)" :
                    "rgb(255, 200, 0)"
                  }` : "0 0 10px rgba(0, 240, 255, 0.2)",
                  pointerEvents: "auto"
                }}
                data-testid={`button-floating-nav-${module.id}`}
              >
                <IconComponent className={`w-6 h-6 ${module.color}`} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
