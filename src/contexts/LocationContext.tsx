import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { distanceM } from "@/lib/resources";
import { regionForCoords } from "@/lib/offlineStore";

export type LocationStatus =
  | "idle"
  | "locating"
  | "live"
  | "last_known"
  | "denied"
  | "unavailable"
  | "error";

export interface Fix {
  lat: number;
  lng: number;
  accuracyM: number;
  heading: number | null;
  speed: number | null;
  timestamp: number;
}

interface LocationCtx {
  fix: Fix | null;
  /** Convenience tuple; null until a real fix exists. No hardcoded fallback. */
  coords: [number, number] | null;
  status: LocationStatus;
  isStale: boolean;
  online: boolean;
  regionId: string | null;
  /** Increments when the user has moved far enough to warrant a data refresh. */
  regionEpoch: number;
  requestLocation: () => void;
  setHighAccuracy: (on: boolean) => void;
}

const LAST_FIX_KEY = "crisisnav.lastFix";
const STALE_MS = 5 * 60 * 1000;
const MOVE_THRESHOLD_M = 40; // ignore GPS jitter
const REFRESH_THRESHOLD_M = 500; // re-query resources after this much movement

const LocationContext = createContext<LocationCtx | undefined>(undefined);

function loadLastFix(): Fix | null {
  try {
    const raw = localStorage.getItem(LAST_FIX_KEY);
    return raw ? (JSON.parse(raw) as Fix) : null;
  } catch {
    return null;
  }
}

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const cached = loadLastFix();
  const [fix, setFix] = useState<Fix | null>(cached);
  const [status, setStatus] = useState<LocationStatus>(
    cached ? "last_known" : "idle",
  );
  const [online, setOnline] = useState(navigator.onLine);
  const [highAccuracy, setHighAccuracy] = useState(false);
  const [regionEpoch, setRegionEpoch] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const anchorRef = useRef<[number, number] | null>(
    cached ? [cached.lat, cached.lng] : null,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const handlePosition = useCallback((pos: GeolocationPosition) => {
    const next: Fix = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracyM: pos.coords.accuracy ?? 0,
      heading: Number.isFinite(pos.coords.heading as number)
        ? (pos.coords.heading as number)
        : null,
      speed: Number.isFinite(pos.coords.speed as number)
        ? (pos.coords.speed as number)
        : null,
      timestamp: pos.timestamp || Date.now(),
    };
    setStatus("live");
    try {
      localStorage.setItem(LAST_FIX_KEY, JSON.stringify(next));
    } catch {
      /* storage full — non fatal */
    }

    setFix((prev) => {
      if (
        prev &&
        distanceM([prev.lat, prev.lng], [next.lat, next.lng]) < MOVE_THRESHOLD_M &&
        next.accuracyM >= prev.accuracyM
      ) {
        return { ...prev, timestamp: next.timestamp };
      }
      return next;
    });

    const anchor = anchorRef.current;
    if (
      !anchor ||
      distanceM(anchor, [next.lat, next.lng]) > REFRESH_THRESHOLD_M ||
      regionForCoords(anchor[0], anchor[1]).id !==
        regionForCoords(next.lat, next.lng).id
    ) {
      anchorRef.current = [next.lat, next.lng];
      setRegionEpoch((e) => e + 1);
    }
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) setStatus("denied");
    else if (err.code === err.POSITION_UNAVAILABLE) setStatus("unavailable");
    else setStatus((s) => (s === "live" ? "last_known" : "error"));
  }, []);

  const startWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    setStatus((s) => (s === "live" ? s : "locating"));
    navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
      enableHighAccuracy: highAccuracy,
      timeout: 10000,
      maximumAge: 30000,
    });
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      { enableHighAccuracy: highAccuracy, timeout: 20000, maximumAge: 5000 },
    );
  }, [handlePosition, handleError, highAccuracy]);

  useEffect(() => {
    startWatch();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [startWatch]);

  const value = useMemo<LocationCtx>(() => {
    const isStale =
      status !== "live" || !fix || Date.now() - fix.timestamp > STALE_MS;
    return {
      fix,
      coords: fix ? [fix.lat, fix.lng] : null,
      status,
      isStale,
      online,
      regionId: fix ? regionForCoords(fix.lat, fix.lng).id : null,
      regionEpoch,
      requestLocation: startWatch,
      setHighAccuracy,
    };
  }, [fix, status, online, regionEpoch, startWatch]);

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};
