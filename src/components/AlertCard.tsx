import { type Alert, severityColors, typeIcons } from "@/lib/mockAlerts";
import { MapPin, Clock, ShieldCheck, Navigation } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

interface AlertCardProps {
  alert: Alert;
  onNavigate?: (alert: Alert) => void;
}

export const AlertCard = ({ alert, onNavigate }: AlertCardProps) => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);

  const confidenceColors = {
    high: "text-danger",
    medium: "text-warning",
    low: "text-muted-foreground",
  };

  const confidenceBg = {
    high: "bg-danger/10",
    medium: "bg-warning/10",
    low: "bg-muted",
  };

  return (
    <div className="alert-slide-in rounded-xl border border-border bg-card overflow-hidden">
      {/* Main alert info */}
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{typeIcons[alert.type]}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground truncate">{alert.title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severityColors[alert.severity]}`}>
                {alert.severity.toUpperCase()}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {alert.distance}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {alert.time}
              </span>
              <span className={`flex items-center gap-1 font-semibold ${confidenceColors[alert.confidence]}`}>
                <ShieldCheck className="h-3 w-3" /> {alert.confidence.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action steps */}
      <div className={`px-3 py-2 border-t border-border ${confidenceBg[alert.confidence]}`}>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
          {t("nav_action_steps")}
        </p>
        <ul className="space-y-0.5 text-xs text-foreground">
          <li>• {t("nav_avoid_area")} — {alert.distance}</li>
          <li>• {t("nav_navigate_safety")}</li>
        </ul>
      </div>

      {/* Navigate button */}
      {onNavigate && (
        <button
          onClick={() => onNavigate(alert)}
          className="flex w-full items-center justify-center gap-2 border-t border-border bg-primary/10 px-3 py-2.5 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
        >
          <Navigation className="h-4 w-4" />
          {t("nav_navigate_safety")}
        </button>
      )}
    </div>
  );
};
