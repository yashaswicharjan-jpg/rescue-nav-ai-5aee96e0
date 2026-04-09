import { Shield, Globe, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "./LanguageSelector";

export const SafePathHeader = () => {
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-foreground">SafePath</h1>
            <p className="text-[10px] leading-none text-muted-foreground">CrisisNav AI</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-full bg-safe/10 px-2 py-1">
            <Zap className="h-3 w-3 text-safe" />
            <span className="text-xs font-medium text-safe">LIVE</span>
          </div>
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};
