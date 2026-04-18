import { useEffect, useState } from "react";
import { AlertTriangle, MapPin, Users, Radio, Phone, Building2, CheckCircle2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Step {
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "danger" | "warning" | "primary" | "safe";
}

const STEPS: Step[] = [
  { title: "FLOOD WARNING — Pune District", body: "Map zooming to your area. Blue overlay shows projected flood zones over the next 6 hours.", icon: AlertTriangle, tone: "danger" },
  { title: "AI Evacuation Plan", body: "Based on your profile (cannot swim, 2 pets): evacuate by car via NH-48. Avoid all underpasses and the river road.", icon: MapPin, tone: "warning" },
  { title: "Community Status", body: "6 nearby members detected. Priya (120m): Evacuating. Anita (510m): Needs Help — flagging for rescue priority.", icon: Users, tone: "primary" },
  { title: "Mesh Network Auto-Reroute", body: "2 mesh nodes offline due to flood damage. Traffic auto-rerouted through Relay 1. You remain connected.", icon: Radio, tone: "warning" },
  { title: "SOS Auto-Prompt", body: "All 3 emergency contacts notified. Hospital + Police dispatched. Your live location is being shared.", icon: Phone, tone: "danger" },
  { title: "Government Report Filed", body: "Your profile + location shared with Pune District Emergency Control Room. Reference #PDEC-2847-FL.", icon: Building2, tone: "primary" },
  { title: "Demo Complete", body: "In a real emergency, all these steps happen automatically when you tap SOS. Your profile makes the response personalized.", icon: CheckCircle2, tone: "safe" },
];

const TONE_CLS: Record<Step["tone"], string> = {
  danger: "border-danger/40 bg-danger/10 text-danger",
  warning: "border-warning/40 bg-warning/10 text-warning",
  primary: "border-primary/40 bg-primary/10 text-primary",
  safe: "border-safe/40 bg-safe/10 text-safe",
};

interface Props {
  onClose: () => void;
}

export const FloodDemoOverlay = ({ onClose }: Props) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length - 1) return;
    const timer = setTimeout(() => setCurrent((c) => Math.min(c + 1, STEPS.length - 1)), 3000);
    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    toast.warning("⚠️ FLOOD SCENARIO ACTIVE — Demo Mode", { duration: 2000 });
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-background/95 backdrop-blur">
      {/* Banner */}
      <div className="flex items-center justify-between bg-danger px-4 py-3 text-danger-foreground">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-bold">FLOOD SCENARIO — DEMO</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-danger-foreground/20 p-1.5 hover:bg-danger-foreground/30"
          aria-label="Stop demo"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-1 px-4 pt-3">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= current ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {STEPS.slice(0, current + 1).map((step, idx) => {
          const Icon = step.icon;
          const isLatest = idx === current;
          return (
            <div
              key={idx}
              className={`flex gap-3 rounded-xl border-2 p-4 transition-all ${TONE_CLS[step.tone]} ${
                isLatest ? "scale-100 opacity-100" : "scale-[0.98] opacity-70"
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-bold">STEP {idx + 1}</span>
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="text-xs text-foreground/80">{step.body}</p>
              </div>
            </div>
          );
        })}
        {current < STEPS.length - 1 && (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Next step in 3s…
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-card p-4">
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          {current >= STEPS.length - 1 ? "Close Demo" : "Stop Demo"}
        </button>
      </div>
    </div>
  );
};
