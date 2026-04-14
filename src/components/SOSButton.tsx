import { useState, useCallback } from "react";
import { Phone, AlertTriangle, Loader2, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { toast } from "sonner";

export const SOSButton = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [failed, setFailed] = useState(false);

  const triggerSOS = useCallback(() => {
    if (sending || sent) return;

    // Vibrate for haptic feedback
    navigator.vibrate?.([200, 100, 200]);

    setSending(true);
    setFailed(false);

    const sendAlert = (lat?: number, lng?: number) => {
      const profile = localStorage.getItem("safepath_profile");
      const profileData = profile ? JSON.parse(profile) : {};

      // Simulate sending SOS
      setTimeout(() => {
        setSending(false);
        setSent(true);
        setShowStatus(true);
        navigator.vibrate?.([100]);

        const locationStr = lat && lng
          ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          : "";

        toast.success(t("sos_sent"), {
          description: locationStr ? `${t("sos_share_location")}: ${locationStr}` : undefined,
          duration: 6000,
        });

        setTimeout(() => {
          setSent(false);
          setShowStatus(false);
        }, 6000);
      }, 1200);
    };

    navigator.geolocation?.getCurrentPosition(
      (pos) => sendAlert(pos.coords.latitude, pos.coords.longitude),
      () => sendAlert(), // Send even without location
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [sending, sent, t]);

  const retrySOS = () => {
    setFailed(false);
    triggerSOS();
  };

  return (
    <>
      {/* Main SOS Button — single tap activation */}
      <button
        onClick={triggerSOS}
        disabled={sending}
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all ${
          sent
            ? "bg-safe text-safe-foreground scale-110"
            : sending
            ? "bg-warning text-warning-foreground animate-pulse"
            : "bg-danger text-danger-foreground sos-pulse"
        }`}
        aria-label="SOS Emergency"
      >
        <div className="text-center">
          {sending ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : sent ? (
            <Check className="mx-auto h-6 w-6" />
          ) : (
            <Phone className="mx-auto h-6 w-6" />
          )}
          <span className="text-[9px] font-bold">{t("sos")}</span>
        </div>
      </button>

      {/* SOS Sent Status Overlay */}
      {showStatus && (
        <div className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center bg-safe/95 px-4 py-4 shadow-lg animate-in slide-in-from-top">
          <div className="flex items-center gap-3">
            <Check className="h-6 w-6 text-safe-foreground" />
            <span className="text-base font-bold text-safe-foreground">{t("sos_status_sent")}</span>
          </div>
        </div>
      )}
    </>
  );
};
