import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getTranslation, type TranslationKey } from "@/lib/translations";

export type Language = "en" | "es";

const STORAGE_KEY = "omega-language";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { language } = useLanguage();
  const t = useCallback(
    (key: TranslationKey) => getTranslation(language, key),
    [language],
  );
  return { t };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "en" || saved === "es") {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
