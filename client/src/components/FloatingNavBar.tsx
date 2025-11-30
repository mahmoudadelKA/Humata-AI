import { useLocation } from "wouter";
import { Home, Menu, X } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";

interface FloatingNavBarProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  isOnChatPage?: boolean;
}

export function FloatingNavBar({ isSidebarOpen = false, onToggleSidebar, isOnChatPage = false }: FloatingNavBarProps) {
  const { language } = useAppContext();
  const [location, navigate] = useLocation();

  const handleNavigate = (route: string) => {
    console.log("[FloatingNavBar] Navigating to:", route);
    navigate(route);
  };

  // Desktop: left sidebar vertical | Mobile: top center horizontal
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div 
      className="fixed flex gap-2 transition-all duration-300"
      style={{
        top: isMobile ? "20px" : "15%",
        left: isMobile ? "50%" : "20px",
        transform: isMobile ? "translateX(-50%)" : "none",
        flexDirection: isMobile ? "row" : "column",
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

      {/* Sidebar Toggle Button - Show on Mobile Chat Page */}
      {isMobile && isOnChatPage && onToggleSidebar && (
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-3 rounded-full transition-all duration-200 backdrop-blur-lg hover:scale-110 active:scale-95 cursor-pointer"
          style={{
            backgroundColor: isSidebarOpen ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",
            border: isSidebarOpen ? "2px solid rgba(255, 0, 110, 1)" : "1px solid rgba(255, 0, 110, 0.3)",
            boxShadow: isSidebarOpen ? "0 0 15px rgba(255, 0, 110, 0.8)" : "0 0 10px rgba(255, 0, 110, 0.2)",
            pointerEvents: "auto"
          }}
          title={isSidebarOpen ? "إخفاء القائمة" : "عرض القائمة"}
          data-testid="button-floating-nav-sidebar-toggle"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6" style={{ color: "#FF006E" }} />
          ) : (
            <Menu className="w-6 h-6" style={{ color: "#FF006E" }} />
          )}
        </button>
      )}
    </div>
  );
}
