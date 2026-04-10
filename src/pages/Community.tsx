import { useState, useEffect, useRef } from "react";
import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { Bluetooth, MessageSquare, Send, Wifi, WifiOff, Radio, Phone, Users, Signal } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  via: "bluetooth" | "sms" | "online";
}

interface Peer {
  id: string;
  name: string;
  distance: string;
  signal: "strong" | "medium" | "weak";
}

const Community = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [activeTab, setActiveTab] = useState<"chat" | "bluetooth" | "sms">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [btScanning, setBtScanning] = useState(false);
  const [btAvailable, setBtAvailable] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    setBtAvailable("bluetooth" in navigator);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo(0, chatRef.current.scrollHeight);
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const msg: Message = {
      id: Date.now().toString(),
      text: messageInput,
      sender: "You",
      timestamp: new Date(),
      via: isOnline ? "online" : "bluetooth",
    };
    setMessages((prev) => [...prev, msg]);
    setMessageInput("");

    // Simulate receiving a reply
    setTimeout(() => {
      const replies = [
        { sender: "User_A3K", text: "Stay safe! We're near the east shelter." },
        { sender: "Rescue_07", text: "Help is on the way. ETA 15 minutes." },
        { sender: "User_B9M", text: "Road blocked near sector 4. Use alternate route." },
      ];
      const reply = replies[Math.floor(Math.random() * replies.length)];
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: reply.text, sender: reply.sender, timestamp: new Date(), via: isOnline ? "online" : "bluetooth" },
      ]);
    }, 1500);
  };

  const handleBtScan = async () => {
    if (btScanning) {
      setBtScanning(false);
      return;
    }
    setBtScanning(true);

    // Try real Web Bluetooth API
    if ("bluetooth" in navigator) {
      try {
        await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["generic_access"],
        });
      } catch {
        // User cancelled or not supported - use simulation
      }
    }

    // Simulate peer discovery
    setTimeout(() => {
      setPeers([
        { id: "1", name: "User_A3K", distance: "~50m", signal: "strong" },
        { id: "2", name: "User_F7P", distance: "~120m", signal: "medium" },
        { id: "3", name: "Rescue_07", distance: "~200m", signal: "weak" },
      ]);
      setBtScanning(false);
      toast.success(t("bt_connected"));
    }, 3000);
  };

  const handleSmsSend = () => {
    if (!smsNumber.trim() || !smsMessage.trim()) return;
    // Use SMS URI scheme
    const smsUri = `sms:${smsNumber}?body=${encodeURIComponent(smsMessage)}`;
    window.open(smsUri, "_self");
    toast.success(t("sms_sent_success"));
    setSmsMessage("");
  };

  const signalColor = (s: string) =>
    s === "strong" ? "text-safe" : s === "medium" ? "text-warning" : "text-danger";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="p-4">
          {/* Status Bar */}
          <div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-safe" />
              ) : (
                <WifiOff className="h-4 w-4 text-danger" />
              )}
              <span className="text-sm font-medium text-foreground">
                {isOnline ? t("online_mode") : t("offline_mode")}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
              <Users className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-primary">{peers.length} {t("nearby_users")}</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-4 flex gap-1 rounded-lg border border-border bg-card p-1">
            {([
              { key: "chat" as const, icon: MessageSquare, label: t("community_chat") },
              { key: "bluetooth" as const, icon: Bluetooth, label: t("bluetooth_mesh") },
              { key: "sms" as const, icon: Phone, label: t("sms_broadcast") },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-3 py-2">
                  <h3 className="text-sm font-semibold text-foreground">{t("community_chat")}</h3>
                  <p className="text-[10px] text-muted-foreground">{t("community_subtitle")}</p>
                </div>

                <div ref={chatRef} className="h-[350px] overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                      <div className="text-center">
                        <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{t("community_subtitle")}</p>
                      </div>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 ${
                          msg.sender === "You"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-[10px] font-semibold opacity-70">{msg.sender}</p>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[9px] text-muted-foreground">
                        {msg.via === "bluetooth" ? <Bluetooth className="h-2.5 w-2.5" /> : msg.via === "sms" ? <Phone className="h-2.5 w-2.5" /> : <Wifi className="h-2.5 w-2.5" />}
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border p-2">
                  <div className="flex gap-2">
                    <input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={t("type_message")}
                      className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="rounded-lg bg-primary px-3 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bluetooth Tab */}
          {activeTab === "bluetooth" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bluetooth className="h-5 w-5 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">{t("bluetooth_mesh")}</h3>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    btAvailable ? "bg-safe/10 text-safe" : "bg-danger/10 text-danger"
                  }`}>
                    {btAvailable ? t("bt_connected") : t("bt_unavailable")}
                  </span>
                </div>

                <p className="mb-3 text-xs text-muted-foreground">
                  {t("no_internet")}
                </p>

                <button
                  onClick={handleBtScan}
                  className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition-colors ${
                    btScanning
                      ? "bg-danger text-danger-foreground"
                      : "bg-accent text-accent-foreground hover:bg-accent/90"
                  }`}
                >
                  {btScanning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Radio className="h-4 w-4 animate-pulse" />
                      {t("bt_scanning")}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Bluetooth className="h-4 w-4" />
                      {t("start_scan")}
                    </span>
                  )}
                </button>
              </div>

              {/* Connected Peers */}
              {peers.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Users className="h-4 w-4 text-primary" />
                    {t("connected_peers")} ({peers.length})
                  </h4>
                  <div className="space-y-2">
                    {peers.map((peer) => (
                      <div key={peer.id} className="flex items-center justify-between rounded-md bg-secondary p-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
                            <span className="text-xs font-bold text-primary">{peer.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{peer.name}</p>
                            <p className="text-[10px] text-muted-foreground">{peer.distance}</p>
                          </div>
                        </div>
                        <Signal className={`h-4 w-4 ${signalColor(peer.signal)}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SMS Tab */}
          {activeTab === "sms" && (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Phone className="h-5 w-5 text-warning" />
                  <h3 className="text-sm font-semibold text-foreground">{t("sms_broadcast")}</h3>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">
                  {t("no_internet")}
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("sms_number")}</label>
                    <input
                      type="tel"
                      value={smsNumber}
                      onChange={(e) => setSmsNumber(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("type_message")}</label>
                    <textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder={t("type_message")}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                  </div>
                  <button
                    onClick={handleSmsSend}
                    className="w-full rounded-lg bg-warning px-4 py-3 text-sm font-semibold text-warning-foreground hover:bg-warning/90 transition-colors"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Send className="h-4 w-4" />
                      {t("broadcast_sms")}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick SOS SMS */}
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-4">
                <h4 className="mb-2 text-sm font-semibold text-danger">SOS SMS</h4>
                <p className="mb-3 text-xs text-muted-foreground">{t("sos_description")}</p>
                <button
                  onClick={() => {
                    const profile = JSON.parse(localStorage.getItem("safepath_profile") || "{}");
                    const name = profile.fullName || "Unknown";
                    const sosMsg = `🆘 SOS - ${name} needs help! ${profile.medicalConditions ? "Medical: " + profile.medicalConditions : ""}`;
                    setSmsMessage(sosMsg);
                    toast.info("SOS message prepared. Enter a number and send.");
                  }}
                  className="w-full rounded-lg bg-danger px-4 py-3 text-sm font-bold text-danger-foreground hover:bg-danger/90 transition-colors"
                >
                  🆘 {t("sos_activated")}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

export default Community;
