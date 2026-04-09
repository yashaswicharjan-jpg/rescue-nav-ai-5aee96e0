import { type Alert, severityColors, typeIcons } from "@/lib/mockAlerts";
import { MapPin, Clock, ShieldCheck } from "lucide-react";

interface AlertCardProps {
  alert: Alert;
  onClick?: () => void;
}

export const AlertCard = ({ alert, onClick }: AlertCardProps) => {
  const confidenceColors = {
    high: "text-safe",
    medium: "text-warning",
    low: "text-danger",
  };

  return (
    <button
      onClick={onClick}
      className="alert-slide-in w-full rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-secondary"
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{typeIcons[alert.type]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">{alert.title}</h3>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severityColors[alert.severity]}`}>
              {alert.severity.toUpperCase()}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{alert.description}</p>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {alert.distance}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {alert.time}
            </span>
            <span className={`flex items-center gap-1 ${confidenceColors[alert.confidence]}`}>
              <ShieldCheck className="h-3 w-3" /> {alert.confidence}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};
