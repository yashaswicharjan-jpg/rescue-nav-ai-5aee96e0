export interface Language {
  code: string;
  name: string;
  nativeName: string;
  dir?: "ltr" | "rtl";
}

export const languages: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "de", name: "German", nativeName: "Deutsch" },
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ru", name: "Russian", nativeName: "Русский" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська" },
  { code: "sw", name: "Swahili", nativeName: "Kiswahili" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl" },
  { code: "he", name: "Hebrew", nativeName: "עברית", dir: "rtl" },
];

export const getLanguageByCode = (code: string) =>
  languages.find((l) => l.code === code) ?? languages[0];
