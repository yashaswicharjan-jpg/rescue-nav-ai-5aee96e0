import { useState } from "react";
import { Phone, AlertTriangle, MapPin, Loader2, Check, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { toast } from "sonner";

export const SOSButton = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSOS = () => {
    setShowConfirm(true);
  };

  const confirmSOS = () => {
    setSending(true);
    setShowConfirm(false);

    // Get location and send emergency alert
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const profile = localStorage.getItem("safepath_profile");
        const profileData = profile ? JSON.parse(profile) : {};

        // Simulate sending SOS with location data
        setTimeout(() => {
          setSending(false);
          setSent(true);
          toast.success(t("sos_sent"), {
            description: `${t("sos_share_location")}: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            duration: 5000,
          });

          // Try to call emergency number if profile has country
          if (profileData.country) {
            // Could trigger tel: link here
          }

          setTimeout(() => setSent(false), 4000);
        }, 1500);
      },
      () => {
        // Even without location, send SOS
        setTimeout(() => {
          setSending(false);
          setSent(true);
          toast.success(t("sos_sent"));
          setTimeout(() => setSent(false), 4000);
        }, 1500);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <>
      <button
        onClick={handleSOS}
        disabled={sending}
        className={`sos-pulse flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all ${
          sent
            ? "bg-safe text-safe-foreground scale-110"
            : sending
            ? "bg-warning text-warning-foreground animate-pulse"
            : "bg-danger text-danger-foreground"
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

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4" onClick={() => setShowConfirm(false)}>
          <div className="w-full max-w-sm rounded-xl border border-danger/50 bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/20">
                <AlertTriangle className="h-6 w-6 text-danger" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-danger">{t("sos_activated")}</h3>
                <p className="text-xs text-muted-foreground">{t("sos_description")}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-border bg-secondary py-3 text-sm font-semibold text-secondary-foreground hover:bg-muted"
              >
                {t("sos_cancel")}
              </button>
              <button
                onClick={confirmSOS}
                className="flex-1 rounded-lg bg-danger py-3 text-sm font-bold text-danger-foreground hover:bg-danger/90 animate-pulse"
              >
                {t("sos_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
