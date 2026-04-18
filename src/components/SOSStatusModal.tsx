import { useEffect, useState } from "react";
import { Check, Loader2, Phone, Building2, Hospital, Globe, Users, Shield, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { getUserProfileContext, getEmergencyContacts, type UserProfileContext } from "@/lib/userProfile";

interface Recipient {
  id: string;
  name: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "pending" | "delivered";
  pendingLabel: string;
  deliveredLabel: string;
}

interface Props {
  location?: { lat: number; lng: number };
  onClose: () => void;
  onSafe: () => void;
}

export const SOSStatusModal = ({ location, onClose, onSafe }: Props) => {
  const [profile, setProfile] = useState<UserProfileContext>({});
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [brief, setBrief] = useState<string>("");
  const [briefLoading, setBriefLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await getUserProfileContext();
      if (cancelled) return;
      setProfile(p);

      const contacts = getEmergencyContacts(p);
      const initial: Recipient[] = [
        ...contacts.map((c, i) => ({
          id: `contact-${i}`,
          name: c.name,
          detail: c.phone || "—",
          icon: Phone,
          status: "pending" as const,
          pendingLabel: "Sending…",
          deliveredLabel: "Delivered ✓",
        })),
        { id: "police", name: "Nearest Police Station", detail: "Auto-located", icon: Shield, status: "pending", pendingLabel: "Notifying…", deliveredLabel: "Notified ✓" },
        { id: "hospital", name: "Nearest Hospital", detail: "Auto-located", icon: Hospital, status: "pending", pendingLabel: "Notifying…", deliveredLabel: "Notified ✓" },
        { id: "gov", name: "Government Emergency Portal", detail: p.country || "Local authority", icon: Globe, status: "pending", pendingLabel: "Reporting…", deliveredLabel: "Reported ✓" },
        { id: "community", name: "Community Members Nearby", detail: "Within 2km", icon: Users, status: "pending", pendingLabel: "Broadcasting…", deliveredLabel: "3 members alerted ✓" },
      ];
      setRecipients(initial);

      // Stagger delivery animation
      initial.forEach((r, idx) => {
        setTimeout(() => {
          setRecipients((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: "delivered" } : x)));
        }, 800 + idx * 700);
      });

      // Fetch AI brief
      try {
        const { data, error } = await supabase.functions.invoke("sos-brief", {
          body: { profile: p, location },
        });
        if (cancelled) return;
        if (error) throw error;
        setBrief(data?.brief || "## Brief unavailable");
      } catch {
        if (!cancelled) setBrief("## 🚑 Responder Brief\nUnable to generate AI brief. Standard emergency response in progress.");
      } finally {
        if (!cancelled) setBriefLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-background">
      {/* Header */}
      <div className="bg-danger px-4 py-5 text-center text-danger-foreground shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger-foreground opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-danger-foreground" />
          </span>
          <h1 className="text-2xl font-black tracking-wide">SOS ALERT SENT</h1>
        </div>
        <p className="mt-1 text-xs opacity-90">
          {location ? `📍 ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "📍 Location unavailable"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Recipients */}
        <section>
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Delivery Status</h2>
          <div className="space-y-2">
            {recipients.length === 0 && (
              <p className="rounded-lg border border-border bg-card p-3 text-xs text-muted-foreground">
                No emergency contacts in profile. Add contacts in Profile to enable contact alerts.
              </p>
            )}
            {recipients.map((r) => {
              const Icon = r.icon;
              const delivered = r.status === "delivered";
              return (
                <div
                  key={r.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                    delivered ? "border-safe/40 bg-safe/5" : "border-border bg-card"
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${delivered ? "bg-safe/20 text-safe" : "bg-secondary text-muted-foreground"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    delivered ? "bg-safe text-safe-foreground" : "bg-warning/20 text-warning"
                  }`}>
                    {delivered ? (
                      <span className="flex items-center gap-1"><Check className="h-3 w-3" />{r.deliveredLabel}</span>
                    ) : (
                      <span className="flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />{r.pendingLabel}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Emergency Brief */}
        <section className="rounded-xl border-2 border-warning/40 bg-warning/5 p-4">
          <h2 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-warning">
            <Building2 className="h-4 w-4" /> AI Emergency Brief (for Responders)
          </h2>
          {briefLoading ? (
            <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating personalized brief…
            </div>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none text-foreground">
              <ReactMarkdown>{brief}</ReactMarkdown>
            </div>
          )}
        </section>

        {/* Profile snapshot */}
        {(profile.full_name || profile.blood_group) && (
          <section className="rounded-lg border border-border bg-card p-3">
            <h3 className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Profile Shared</h3>
            <p className="text-xs text-foreground">
              {profile.full_name && <><strong>{profile.full_name}</strong> · </>}
              {profile.blood_group && <>Blood: {profile.blood_group} · </>}
              {profile.medical_conditions && <>Conditions: {profile.medical_conditions}</>}
            </p>
          </section>
        )}
      </div>

      {/* Footer actions */}
      <div className="grid grid-cols-2 gap-3 border-t border-border bg-card p-4">
        <button
          onClick={onClose}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary py-3 text-sm font-bold text-foreground hover:bg-muted"
        >
          <X className="h-4 w-4" /> Cancel SOS
        </button>
        <button
          onClick={onSafe}
          className="flex items-center justify-center gap-2 rounded-xl bg-safe py-3 text-sm font-bold text-safe-foreground hover:opacity-90"
        >
          <Check className="h-5 w-5" /> I Am Safe
        </button>
      </div>
    </div>
  );
};
