import { useEffect, useMemo, useState } from "react";
import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import {
  findResources,
  CATEGORY_ICONS,
  resourceLabel,
  type Resource,
  type ResourceCategory,
} from "@/lib/resources";
import { getScoredRoutes, type ScoredRoute } from "@/lib/routeScoring";
import { RouteComparePanel } from "@/components/RouteComparePanel";
import { Loader2, MapPin, Navigation, ShieldCheck, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

const CATEGORIES: ResourceCategory[] = ["hospital", "water", "shelter", "charging"];

const Resources = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [userPos, setUserPos] = useState<[number, number]>([33.88, 35.50]);
  const [category, setCategory] = useState<ResourceCategory>("hospital");
  const [items, setItems] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeTarget, setRouteTarget] = useState<Resource | null>(null);
  const [routes, setRoutes] = useState<{ fastest: ScoredRoute; safest: ScoredRoute } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  // Get user location once
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  // Load resources whenever category or location changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    findResources(userPos, category)
      .then((r) => !cancelled && setItems(r))
      .catch(() => !cancelled && setError(t("resources_error") || "Failed to load resources"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [userPos, category, t]);

  const handleRoute = async (r: Resource) => {
    setRouteTarget(r);
    setRoutes(null);
    setRouteLoading(true);
    const result = await getScoredRoutes(userPos, [r.lat, r.lng]);
    setRoutes(result);
    setRouteLoading(false);
  };

  const closeRoute = () => {
    setRouteTarget(null);
    setRoutes(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 pt-3">
          <h2 className="text-lg font-bold text-foreground">
            {t("find_resources") || "Find Resources"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("nearby_essentials") || "Nearby hospitals, water, shelter & charging"}
          </p>
        </div>

        {/* Category chips */}
        <div className="sticky top-0 z-10 flex gap-2 overflow-x-auto bg-background/95 px-4 py-3 backdrop-blur">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              <span className="mr-1">{CATEGORY_ICONS[c]}</span>
              {resourceLabel(c)}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-2 px-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("loading") || "Searching nearby..."}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
          {!loading && !error && items.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              {t("no_resources") || "No resources found within 5km."}
            </div>
          )}
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} onRoute={handleRoute} t={t} />
          ))}
        </div>
      </main>

      <BottomNav />

      {/* Route comparison overlay */}
      {routeTarget && (
        <RouteComparePanel
          target={{ name: routeTarget.name, lat: routeTarget.lat, lng: routeTarget.lng }}
          userPos={userPos}
          routes={routes}
          loading={routeLoading}
          onClose={closeRoute}
        />
      )}
    </div>
  );
};

const ResourceCard = ({
  resource,
  onRoute,
  t,
}: {
  resource: Resource;
  onRoute: (r: Resource) => void;
  t: (k: any) => string;
}) => {
  const km =
    resource.distanceM < 1000
      ? `${Math.round(resource.distanceM)} m`
      : `${(resource.distanceM / 1000).toFixed(1)} km`;
  const safety: "high" | "medium" | "low" =
    resource.distanceM < 1500 ? "high" : resource.distanceM < 3500 ? "medium" : "low";
  const safetyColor =
    safety === "high"
      ? "text-safe bg-safe/10"
      : safety === "medium"
      ? "text-warning bg-warning/10"
      : "text-danger bg-danger/10";

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{CATEGORY_ICONS[resource.category]}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold text-foreground">{resource.name}</h3>
            {resource.openNow === true && (
              <span className="rounded-full bg-safe/15 px-2 py-0.5 text-[10px] font-bold text-safe">
                OPEN NOW
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {km}
            </span>
            <span
              className={`flex items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold ${safetyColor}`}
            >
              <ShieldCheck className="h-3 w-3" />
              {safety.toUpperCase()} {t("safety") || "SAFETY"}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRoute(resource)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/20"
      >
        <Navigation className="h-4 w-4" />
        {t("compare_routes") || "Compare Safe vs Fast Route"}
      </button>
    </div>
  );
};

export default Resources;
