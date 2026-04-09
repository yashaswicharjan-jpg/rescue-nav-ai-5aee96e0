import { Globe } from "lucide-react";
import { languages } from "@/lib/languages";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LanguageSelector = () => {
  const { language, setLanguageCode } = useLanguage();

  return (
    <Select value={language.code} onValueChange={setLanguageCode}>
      <SelectTrigger className="h-8 w-auto gap-1 border-border bg-secondary px-2 text-xs">
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64 bg-card border-border">
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code} className="text-sm">
            <span>{lang.nativeName}</span>
            <span className="ml-2 text-muted-foreground">({lang.name})</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
