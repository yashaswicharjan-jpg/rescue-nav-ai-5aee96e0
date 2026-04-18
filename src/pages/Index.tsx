import { useState, useEffect } from "react";
import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { MapView } from "@/components/MapView";
import { AlertCard } from "@/components/AlertCard";
import { EmergencyInfoCard } from "@/components/EmergencyInfoCard";
import { NavigationOverlay } from "@/components/NavigationOverlay";
import { FloodDemoOverlay } from "@/components/FloodDemoOverlay";
import { mockAlerts, type Alert } from "@/lib/mockAlerts";
import { AlertTriangle, Waves } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

const Index = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [navAlert, setNavAlert] = useState<Alert | null>(null);
  const [showFloodDemo, setShowFloodDemo] = useState(false);
  const [userPos, setUserPos] = useState<[number, number]>([33.88, 35.50]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Emergency Info Quick Card */}
        <div className="px-4 pt-3 pb-1">
          <EmergencyInfoCard />
        </div>

        {/* Map */}
        <div className="p-4 pb-2">
          <MapView />
        </div>

        {/* Active Alerts */}
        <div className="px-4 py-3">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-danger" />
            {t("active_alerts")}
            <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-danger-foreground">
              {mockAlerts.length}
            </span>
          </h2>
          <div className="space-y-2">
            {mockAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onNavigate={(a) => setNavAlert(a)}
              />
            ))}
          </div>
        </div>

        {/* Safety Status */}
        <div className="mx-4 mb-4 rounded-lg border border-border bg-card p-4">
          <p className="text-center text-xs text-muted-foreground">
            {t("disclaimer")}
          </p>
        </div>
      </main>

      <BottomNav />

      {/* Flood demo trigger */}
      <button
        onClick={() => setShowFloodDemo(true)}
        className="fixed bottom-24 left-4 z-40 flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground shadow-lg hover:opacity-90"
        aria-label="Run flood demo"
      >
        <Waves className="h-3.5 w-3.5" />
        Run Flood Demo
      </button>

      {/* Full-screen navigation overlay */}
      {navAlert && (
        <NavigationOverlay
          alert={navAlert}
          userPos={userPos}
          onClose={() => setNavAlert(null)}
        />
      )}

      {showFloodDemo && <FloodDemoOverlay onClose={() => setShowFloodDemo(false)} />}
    </div>
  );
};

export default Index;
