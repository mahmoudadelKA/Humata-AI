import { useState, useEffect, useRef } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe } from "lucide-react";
import { AppContext, useAppContext } from "@/lib/appContext";
import type { Language, Theme, AppContextType, User } from "@/lib/appContext";
import { Auth } from "@/components/Auth";
import Hub from "@/pages/Hub";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";
import { AuthModal } from "@/components/AuthModal";

function TopLeftControls() {
  const { language, theme, setLanguage, setTheme } = useAppContext();

  return (
    <div className={`fixed top-4 z-50 flex items-center gap-3 bg-muted/30 border border-border/40 rounded-2xl px-4 py-3 backdrop-blur-md hover:bg-muted/40 transition-all ${language === "ar" ? "right-4 flex-row-reverse font-bold" : "left-4"}`}>
      {/* Auth Component */}
      <Auth />

      <div className="w-0.5 h-7 bg-border/40 rounded-full"></div>

      {/* Theme Controls */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        data-testid="button-theme-toggle"
        className="h-9 w-9 rounded-lg hover:bg-primary/10"
        title={theme === "dark" ? "Light Mode" : "Dark Mode"}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 text-primary" />
        ) : (
          <Moon className="w-5 h-5 text-primary" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
        data-testid="button-language-toggle"
        className="h-9 w-9 rounded-lg hover:bg-accent/10 flex items-center justify-center gap-1"
        title={language === "ar" ? "English" : "العربية"}
      >
        <Globe className="w-5 h-5 text-accent" />
        <span className="text-[11px] font-bold text-accent">{language.toUpperCase()}</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        data-testid="button-reserved"
        className="h-9 w-9 opacity-40 cursor-default rounded-lg"
        disabled
        title="Reserved for future use"
      >
        <div className="w-2 h-2 rounded-full bg-primary/50"></div>
      </Button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Hub} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { showAuthModal } = useAppContext();
  
  return (
    <>
      <TopLeftControls />
      <Router />
      {showAuthModal && <AuthModal />}
    </>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("ar");
  const [theme, setTheme] = useState<Theme>("dark");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedLang = localStorage.getItem("language") as Language | null;

    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("language", language);
    
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }

    document.documentElement.setAttribute("lang", language);
  }, [theme, language]);

  const contextValue: AppContextType = {
    language,
    theme,
    user,
    token,
    setLanguage,
    setTheme,
    setUser,
    setToken,
    showAuthModal,
    setShowAuthModal,
    isLogin,
    setIsLogin,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContext.Provider value={contextValue}>
          <Toaster />
          <AppContent />
        </AppContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
