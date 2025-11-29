import { useState, useRef, useEffect } from "react";
import { useAppContext } from "@/lib/appContext";
import { t } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, ChevronDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

export function Auth() {
  const { language, user, setUser, setToken } = useAppContext();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      verifyTokenMutation.mutate(token);
    }
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

  const signupMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Signup failed");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("authToken", data.token);
        setShowAuthModal(false);
        setFormData({ name: "", email: "", password: "" });
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Login failed");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("authToken", data.token);
        setShowAuthModal(false);
        setFormData({ name: "", email: "", password: "" });
      }
    },
  });

  const verifyTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Verification failed");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        setToken(localStorage.getItem("authToken"));
      }
    },
    onError: () => {
      localStorage.removeItem("authToken");
      setUser(null);
      setToken(null);
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setToken(null);
    setShowUserMenu(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      signupMutation.mutate(formData);
    }
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

  return (
    <>
      <div className={`flex items-center gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsLogin(true);
            setShowAuthModal(true);
          }}
          className={`h-8 px-3 text-sm ${language === "ar" ? "font-bold" : ""}`}
          data-testid="button-login"
        >
          {language === "ar" ? "تسجيل دخول" : "Login"}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setIsLogin(false);
            setShowAuthModal(true);
          }}
          className={`h-8 px-3 text-sm ${language === "ar" ? "font-bold" : ""}`}
          data-testid="button-signup"
        >
          {language === "ar" ? "تسجيل" : "Signup"}
        </Button>
      </div>

      {showAuthModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
          onClick={() => setShowAuthModal(false)}
          data-testid="modal-backdrop"
        >
          <div 
            className="relative bg-card border border-border/60 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in scale-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors duration-200"
              data-testid="button-close-modal"
              aria-label="Close modal"
            >
              <span className="text-xl font-bold">✕</span>
            </button>

            <h2 className={`text-2xl font-bold mb-6 text-foreground ${language === "ar" ? "text-3xl" : ""}`}>
              {isLogin ? (language === "ar" ? "تسجيل الدخول" : "Login") : (language === "ar" ? "إنشاء حساب" : "Create Account")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input
                  type="text"
                  placeholder={language === "ar" ? "الاسم" : "Name"}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                  required
                  data-testid="input-name"
                />
              )}
              <input
                type="email"
                placeholder={language === "ar" ? "البريد الإلكتروني" : "Email"}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                required
                data-testid="input-email"
              />
              <input
                type="password"
                placeholder={language === "ar" ? "كلمة المرور" : "Password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                required
                data-testid="input-password"
              />

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={loginMutation.isPending || signupMutation.isPending}
                data-testid="button-submit-auth"
              >
                {loginMutation.isPending || signupMutation.isPending ? "..." : (isLogin ? (language === "ar" ? "دخول" : "Login") : (language === "ar" ? "تسجيل" : "Signup"))}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className={`text-sm text-primary hover:underline transition-colors duration-200 ${language === "ar" ? "font-bold" : ""}`}
              >
                {isLogin ? (language === "ar" ? "لا تملك حساب؟ سجل الآن" : "Don't have an account? Sign up") : (language === "ar" ? "لديك حساب بالفعل؟ سجل الدخول" : "Already have an account? Login")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
