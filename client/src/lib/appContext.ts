import { createContext, useContext } from "react";

export type Language = "ar" | "en";
export type Theme = "light" | "dark";

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AppContextType {
  language: Language;
  theme: Theme;
  user: User | null;
  token: string | null;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};
