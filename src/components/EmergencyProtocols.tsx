import { useState } from "react";
import { emergencyProtocols } from "@/lib/emergencyProtocols";
import { ChevronRight, AlertTriangle } from "lucide-react";

export const EmergencyProtocols = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = emergencyProtocols.find((p) => p.id === selectedId);

  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <AlertTriangle className="h-4 w-4 text-warning" />
        Emergency Protocols
      </h2>

      {!selected ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {emergencyProtocols.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="flex flex-col items-center gap-1 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-secondary"
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-xs font-medium text-foreground">{p.title}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
              <span className="text-xl">{selected.icon}</span> {selected.title}
            </h3>
            <button onClick={() => setSelectedId(null)} className="text-xs text-muted-foreground hover:text-foreground">
              ← Back
            </button>
          </div>
          <ol className="space-y-2">
            {selected.steps.map((s) => (
              <li key={s.step} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    s.urgency === "immediate"
                      ? "bg-danger text-danger-foreground"
                      : s.urgency === "high"
                      ? "bg-warning text-warning-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {s.step}
                </span>
                <span className="text-sm text-foreground">{s.instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};
