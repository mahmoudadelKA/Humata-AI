import { useState } from "react";
import { useAppContext } from "@/lib/appContext";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";

export function AuthModal() {
  const { language, user, setUser, setToken, showAuthModal, setShowAuthModal, isLogin, setIsLogin } = useAppContext();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

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
        console.log("[AuthModal] Signup successful, storing token");
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("authToken", data.token);
        setShowAuthModal(false);
        setFormData({ name: "", email: "", password: "" });
      }
    },
    onError: (error) => {
      console.error("[AuthModal] Signup failed:", error);
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
        console.log("[AuthModal] Login successful, storing token");
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("authToken", data.token);
        setShowAuthModal(false);
        setFormData({ name: "", email: "", password: "" });
      }
    },
    onError: (error) => {
      console.error("[AuthModal] Login failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email: formData.email, password: formData.password });
    } else {
      signupMutation.mutate(formData);
    }
  };

  if (!showAuthModal) {
    console.log("[AuthModal] Modal hidden - showAuthModal is false");
    return null;
  }

  console.log("[AuthModal] Rendering modal - isLogin:", isLogin);

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200"
      onClick={() => {
        console.log("[AuthModal] Backdrop clicked, closing modal");
        setShowAuthModal(false);
      }}
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
  );
}
