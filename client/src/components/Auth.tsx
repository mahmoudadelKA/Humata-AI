import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/lib/appContext";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export function Auth() {
  const { language, user, setUser, setToken, setShowAuthModal, setIsLogin } = useAppContext();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const verifyTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies with request
      });
      if (!response.ok) throw new Error("Verification failed");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.user.id);
      }
    },
    onError: () => {
      setUser(null);
      setToken(null);
    },
  });

  useEffect(() => {
    // Check for existing session via cookie
    verifyTokenMutation.mutate();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setUser(null);
        setToken(null);
        setShowUserMenu(false);
      },
    });
  };

  if (user) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-primary/20 transition-colors ${language === "ar" ? "font-bold flex-row-reverse" : ""}`}
          data-testid="button-user-menu"
        >
          <span className="text-primary font-semibold text-sm">{user.name}</span>
          <ChevronDown className="w-4 h-4 text-primary" />
        </button>

        {showUserMenu && (
          <div className={`absolute top-full ${language === "ar" ? "left-0" : "right-0"} mt-2 bg-card border border-border rounded-lg shadow-lg z-50`}>
            <button
              onClick={handleLogout}
              className={`w-full px-4 py-2 text-left text-red-500 hover:bg-muted transition-colors flex items-center gap-2 font-semibold ${language === "ar" ? "flex-row-reverse" : ""}`}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4" />
              {language === "ar" ? "تسجيل الخروج" : "Logout"}
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleLoginClick = () => {
    console.log("[Auth] Login button clicked");
    setIsLogin(true);
    setShowAuthModal(true);
  };

  const handleSignupClick = () => {
    console.log("[Auth] Signup button clicked");
    setIsLogin(false);
    setShowAuthModal(true);
  };

  return (
    <div className={`flex items-center gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLoginClick}
        className={`h-8 px-3 text-sm cursor-pointer ${language === "ar" ? "font-bold" : ""}`}
        data-testid="button-login"
        type="button"
      >
        {language === "ar" ? "تسجيل دخول" : "Login"}
      </Button>
      <Button
        size="sm"
        onClick={handleSignupClick}
        className={`h-8 px-3 text-sm cursor-pointer ${language === "ar" ? "font-bold" : ""}`}
        data-testid="button-signup"
        type="button"
      >
        {language === "ar" ? "تسجيل" : "Signup"}
      </Button>
    </div>
  );
}
