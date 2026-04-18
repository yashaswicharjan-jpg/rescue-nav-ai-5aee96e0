import { useState, useCallback } from "react";
import { Phone, Loader2, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { toast } from "sonner";
import { SOSStatusModal } from "./SOSStatusModal";

export const SOSButton = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();

  const triggerSOS = useCallback(() => {
    if (sending || showModal) return;
    navigator.vibrate?.([200, 100, 200]);
    setSending(true);

    const launchModal = (lat?: number, lng?: number) => {
      setTimeout(() => {
        setSending(false);
        setLocation(lat && lng ? { lat, lng } : undefined);
        setShowModal(true);
        navigator.vibrate?.([100]);
        toast.success(t("sos_sent"), { duration: 3000 });
      }, 600);
    };

    navigator.geolocation?.getCurrentPosition(
      (pos) => launchModal(pos.coords.latitude, pos.coords.longitude),
      () => launchModal(),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [sending, showModal, t]);

  return (
    <>
      <button
        onClick={triggerSOS}
        disabled={sending || showModal}
        className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all ${
          showModal
            ? "bg-safe text-safe-foreground"
            : sending
            ? "bg-warning text-warning-foreground animate-pulse"
            : "bg-danger text-danger-foreground sos-pulse"
        }`}
        aria-label="SOS Emergency"
      >
        <div className="text-center">
          {sending ? (
            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
          ) : showModal ? (
            <Check className="mx-auto h-6 w-6" />
          ) : (
            <Phone className="mx-auto h-6 w-6" />
          )}
          <span className="text-[9px] font-bold">{t("sos")}</span>
        </div>
      </button>

      {showModal && (
        <SOSStatusModal
          location={location}
          onClose={() => setShowModal(false)}
          onSafe={() => {
            setShowModal(false);
            toast.success("Marked safe. Contacts notified.", { duration: 4000 });
          }}
        />
      )}
    </>
  );
};
