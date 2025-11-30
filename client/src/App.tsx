import { useState, useEffect, useRef } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { AppContext, useAppContext } from "@/lib/appContext";
import type { Language, Theme, AppContextType, User } from "@/lib/appContext";
import { SpaceBackground } from "@/components/SpaceBackground";
import Hub from "@/pages/Hub";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  // Use full URL path + query parameters for the key
  // This ensures Chat component remounts when query params change
  const chatKey = `${location}${typeof window !== "undefined" ? window.location.search : ""}`;
  
  return (
    <Switch>
      <Route path="/" component={Hub} />
      <Route path="/chat">
        {() => <Chat key={chatKey} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  return (
    <div className="relative min-h-screen">
      {/* Animated Space Background */}
      <SpaceBackground />

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
