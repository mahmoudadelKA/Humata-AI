import { useState, useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AppContext, useAppContext } from "@/lib/appContext";
import type { Language, Theme, AppContextType, User } from "@/lib/appContext";
import Hub from "@/pages/Hub";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  return (
    <Switch>
      <Route path="/" component={Hub} />
      <Route path="/chat">
        {() => <Chat key={location} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="relative min-h-screen">
      {/* Animated Background */}
      <div className="animated-bg-container">
        {/* Floating Particles */}
        <div className="floating-particle particle-cyan" style={{ width: '80px', height: '80px', top: '10%', left: '5%' }} />
        <div className="floating-particle particle-magenta" style={{ width: '60px', height: '60px', top: '20%', right: '10%' }} />
        <div className="floating-particle particle-purple" style={{ width: '100px', height: '100px', top: '40%', left: '15%' }} />
        <div className="floating-particle particle-green" style={{ width: '70px', height: '70px', bottom: '20%', right: '15%' }} />
        <div className="floating-particle particle-cyan" style={{ width: '90px', height: '90px', bottom: '10%', left: '20%' }} />
        <div className="floating-particle particle-magenta" style={{ width: '65px', height: '65px', top: '50%', right: '5%' }} />

        {/* Floating Orbs */}
        <div className="floating-orb orb-1" style={{ top: '15%', left: '10%' }} />
        <div className="floating-orb orb-2" style={{ top: '60%', right: '8%' }} />
        <div className="floating-orb orb-3" style={{ bottom: '15%', left: '5%' }} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10">
        <Router />
      </div>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("ar");
  const [theme, setTheme] = useState<Theme>("dark");
  const [user, setUser] = useState<User | null>({ id: "anonymous", name: "مستخدم", email: "" });
  const [token, setToken] = useState<string | null>("anonymous-token");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedLang = localStorage.getItem("language") as Language | null;
    const savedToken = localStorage.getItem("authToken");

    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLanguage(savedLang);
    
    // Restore token from localStorage if available
    if (savedToken) {
      console.log("[App] Restoring token from localStorage");
      setToken(savedToken);
    }
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
    showAuthModal: false,
    setShowAuthModal: () => {},
    isLogin: false,
    setIsLogin: () => {},
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
