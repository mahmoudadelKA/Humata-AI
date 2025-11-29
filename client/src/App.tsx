import { useState, useEffect, createContext, useContext } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe } from "lucide-react";
import Hub from "@/pages/Hub";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

type Language = "ar" | "en";
type Theme = "light" | "dark";

interface AppContextType {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

function TopLeftControls() {
  const { language, theme, setLanguage, setTheme } = useAppContext();

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-muted/20 border border-border/30 rounded-lg p-2 backdrop-blur-sm">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        data-testid="button-theme-toggle"
        className="h-8 w-8"
        title={theme === "dark" ? "Light Mode" : "Dark Mode"}
      >
        {theme === "dark" ? (
          <Sun className="w-4 h-4" />
        ) : (
          <Moon className="w-4 h-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
        data-testid="button-language-toggle"
        className="h-8 w-8"
        title={language === "ar" ? "English" : "العربية"}
      >
        <Globe className="w-4 h-4" />
        <span className="text-[10px] ml-1">{language.toUpperCase()}</span>
      </Button>

      <div className="w-px h-6 bg-border/20"></div>

      <Button
        variant="ghost"
        size="icon"
        data-testid="button-reserved"
        className="h-8 w-8 opacity-50 cursor-default"
        disabled
        title="Reserved for future use"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
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
  return (
    <>
      <TopLeftControls />
      <Router />
    </>
  );
}

function App() {
  const [language, setLanguage] = useState<Language>("ar");
  const [theme, setTheme] = useState<Theme>("dark");

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
    setLanguage,
    setTheme,
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
