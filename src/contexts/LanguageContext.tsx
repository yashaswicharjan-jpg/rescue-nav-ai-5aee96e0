import { createContext, useContext, useState, type ReactNode } from "react";
import { type Language, getLanguageByCode } from "@/lib/languages";

interface LanguageContextType {
  language: Language;
  setLanguageCode: (code: string) => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(getLanguageByCode("en"));

  const setLanguageCode = (code: string) => {
    setLanguage(getLanguageByCode(code));
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguageCode }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
