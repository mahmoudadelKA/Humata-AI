import { useState } from "react";
import { useLocation } from "wouter";
import { Home } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";

export function FloatingNavBar() {
  const { language } = useAppContext();
  const [location, navigate] = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleNavigate = (route: string) => {
    console.log("[FloatingNavBar] Navigating to:", route);
    navigate(route);
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
      {/* Home Button */}
      <button
        type="button"
        onClick={() => handleNavigate("/")}
        className="p-3 rounded-full transition-all duration-200 backdrop-blur-lg hover:scale-110 active:scale-95 cursor-pointer"
        style={{
          backgroundColor: location === "/" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
          border: location === "/" ? "2px solid rgba(0, 240, 255, 1)" : "1px solid rgba(0, 240, 255, 0.3)",
          boxShadow: location === "/" ? "0 0 15px rgba(0, 240, 255, 0.8)" : "0 0 10px rgba(0, 240, 255, 0.2)",
          pointerEvents: "auto"
        }}
        title={t("nav.home", language)}
        data-testid="button-floating-nav-home"
      >
        <Home className="w-6 h-6 text-cyan-400" />
      </button>

      {/* WhatsApp Contact Link */}
      <a
        href="https://wa.me/qr/P6WIWVS7UAU5P1"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3 rounded-full transition-all duration-200 backdrop-blur-lg hover:scale-110 active:scale-95 cursor-pointer inline-flex items-center justify-center"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          border: "1px solid rgba(31, 193, 120, 0.3)",
          boxShadow: "0 0 10px rgba(31, 193, 120, 0.2)",
          pointerEvents: "auto"
        }}
        title="Contact via WhatsApp"
        data-testid="button-floating-nav-whatsapp"
      >
        <SiWhatsapp className="w-6 h-6" style={{ color: "#1fC158" }} />
      </a>
    </div>
  );
}
