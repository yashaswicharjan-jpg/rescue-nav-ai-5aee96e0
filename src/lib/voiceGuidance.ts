// Voice navigation guidance using browser Speech Synthesis API

let currentUtterance: SpeechSynthesisUtterance | null = null;
let isEnabled = true;

const LANG_MAP: Record<string, string> = {
  en: "en-US", ar: "ar-SA", fr: "fr-FR", es: "es-ES",
  hi: "hi-IN", ur: "ur-PK", zh: "zh-CN", ja: "ja-JP",
  ko: "ko-KR", de: "de-DE", pt: "pt-BR", ru: "ru-RU",
  tr: "tr-TR", bn: "bn-BD", sw: "sw-KE", ha: "ha-NG",
  ps: "ps-AF", uk: "uk-UA",
};

export const voiceGuidance = {
  speak(text: string, langCode: string = "en") {
    if (!isEnabled || !window.speechSynthesis) return;
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[langCode] || "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  },

  stop() {
    window.speechSynthesis?.cancel();
    currentUtterance = null;
  },

  setEnabled(enabled: boolean) {
    isEnabled = enabled;
    if (!enabled) this.stop();
  },

  isEnabled() {
    return isEnabled;
  },

  isSupported() {
    return "speechSynthesis" in window;
  },
};
