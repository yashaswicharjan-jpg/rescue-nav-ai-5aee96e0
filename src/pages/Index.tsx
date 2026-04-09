import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { MapView } from "@/components/MapView";
import { AlertCard } from "@/components/AlertCard";
import { mockAlerts } from "@/lib/mockAlerts";
import { AlertTriangle } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        {/* Map */}
        <div className="p-4 pb-2">
          <MapView />
        </div>

        {/* Active Alerts */}
        <div className="px-4 py-3">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-danger" />
            Active Alerts
            <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-danger-foreground">
              {mockAlerts.length}
            </span>
          </h2>
          <div className="space-y-2">
            {mockAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>

        {/* Safety Status */}
        <div className="mx-4 mb-4 rounded-lg border border-border bg-card p-4">
          <p className="text-center text-xs text-muted-foreground">
            ⚖️ SafePath is a decision support system, not an authority.
            Always verify with official emergency services.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default Index;
