import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX, Camera, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  isLoading?: boolean;
}

export const ChatInterface = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `## ${t("welcome_title")}\n\n${t("welcome_msg")}`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    setMessages((prev) => prev.map((m) =>
      m.id === "welcome" ? { ...m, content: `## ${t("welcome_title")}\n\n${t("welcome_msg")}` } : m
    ));
  }, [language.code]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const speak = (text: string) => {
    stopSpeaking();
    const clean = text.replace(/[#*_`]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language.code;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = language.code;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      setInput(e.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      analyzeImage(base64, file.type, previewURL);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const analyzeImage = async (base64Data: string, mimeType: string, previewURL: string) => {
    setIsLoading(true);
    const userText = input.trim();
    setInput("");

    const userMsgId = Date.now().toString();
    const loadingId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: userText || "📷 Photo sent for crisis analysis", imagePreview: previewURL },
      { id: loadingId, role: "assistant", content: "Analyzing image...", isLoading: true },
    ]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-crisis-image", {
        body: { imageBase64: base64Data, mimeType, userText, language: language.code },
      });

      if (error) throw error;

      const reply = data?.reply || "Unable to analyze image. Call emergency services: 112 / 911 / 999.";
      setMessages((prev) => prev.map((m) =>
        m.id === loadingId ? { ...m, content: reply, isLoading: false } : m
      ));
    } catch (err: any) {
      const msg = err?.message?.includes("429")
        ? "Too many requests. Please wait a moment and try again."
        : err?.message?.includes("402")
        ? "AI credits exhausted. Please add funds in workspace settings."
        : "Analysis failed. If in danger, call emergency services immediately: 112 / 911 / 999.";
      toast.error(msg);
      setMessages((prev) => prev.map((m) =>
        m.id === loadingId ? { ...m, content: msg, isLoading: false } : m
      ));
    } finally {
      setIsLoading(false);
      setImagePreview(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(userMsg.content, language.code),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}
            >
              {msg.imagePreview && (
                <img
                  src={msg.imagePreview}
                  alt="Sent for analysis"
                  className="mb-2 max-h-48 w-full rounded-lg border border-border object-cover"
                />
              )}
              {msg.isLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: "300ms" }} />
                  <span className="ml-1 text-xs text-muted-foreground">{msg.content}</span>
                </div>
              ) : msg.role === "assistant" ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              {msg.role === "assistant" && !msg.isLoading && msg.id !== "welcome" && (
                <button
                  onClick={() => (isSpeaking ? stopSpeaking() : speak(msg.content))}
                  className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                >
                  {isSpeaking ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  {isSpeaking ? t("stop") : t("listen")}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="flex items-center gap-3 border-t border-border bg-secondary/50 px-3 py-2">
          <img src={imagePreview} alt="Preview" className="h-12 w-12 rounded-md border border-border object-cover" />
          <span className="flex-1 text-xs text-muted-foreground">📷 Photo ready — analyzing now...</span>
          <button
            onClick={() => setImagePreview(null)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-muted/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="border-t border-border bg-card p-3">
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageCapture}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            title="Send photo for crisis analysis"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger text-danger-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Camera className="h-4 w-4" />
          </button>
          <button
            onClick={toggleListening}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
              isListening ? "bg-danger text-danger-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={t("describe_emergency")}
            className="flex-1 rounded-full border border-border bg-secondary px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="mt-2 w-full rounded-lg bg-danger/10 py-2 text-xs font-medium text-danger hover:bg-danger/20"
          >
            {t("stop_speaking")}
          </button>
        )}
      </div>
    </div>
  );
};

function getSimulatedResponse(query: string, lang: string): string {
  const q = query.toLowerCase();
  if (q.includes("explosion") || q.includes("bomb") || q.includes("airstrike")) {
    return `## 🚨 Immediate Action Required\n\n1. **DROP** to the ground immediately\n2. **MOVE** to the nearest concrete structure or basement\n3. **STAY AWAY** from windows and glass\n4. **COVER** your head and neck\n5. **WAIT** at least 10 minutes before moving\n\n⚠️ If you hear secondary explosions, remain sheltered.`;
  }
  if (q.includes("flood") || q.includes("water")) {
    return `## 🌊 Flood Safety\n\n1. **Move to higher ground** immediately\n2. **Never walk** through moving water\n3. **Avoid** bridges over fast-moving water\n4. If trapped: go to the **highest floor**\n5. **Do not** touch electrical equipment`;
  }
  if (q.includes("earthquake") || q.includes("shaking")) {
    return `## 🌍 Earthquake Response\n\n1. **DROP, COVER, and HOLD ON**\n2. Get under a **sturdy table**\n3. Stay away from **exterior walls**\n4. If outdoors: move to an **open area**\n5. After shaking: check for **gas leaks**`;
  }
  return `## 🛡️ General Safety\n\n1. **Stay calm** — panic reduces survival chances\n2. **Seek shelter** in the nearest solid structure\n3. **Stay low** and away from windows\n4. **Conserve** your phone battery\n5. **Signal** for help if trapped\n\nTell me more about your specific situation.`;
}
