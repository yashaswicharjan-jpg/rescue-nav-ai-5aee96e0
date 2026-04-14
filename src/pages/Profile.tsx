import { useState } from "react";
import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { emergencyContactsByCountry, getContactsByCountry } from "@/lib/emergencyContacts";
import { User, Phone, Heart, Shield, Save, Check, ChevronDown, LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

interface UserProfile {
  fullName: string;
  age: string;
  bloodType: string;
  medicalConditions: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  country: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const Profile = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const { user, loading, signOut } = useAuth();
  const [saved, setSaved] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(() => {
    const stored = localStorage.getItem("safepath_profile");
    return stored
      ? JSON.parse(stored)
      : { fullName: "", age: "", bloodType: "", medicalConditions: "", allergies: "", emergencyContactName: "", emergencyContactPhone: "", country: "United States" };
  });

  const countryContacts = getContactsByCountry(profile.country);

  const handleSave = () => {
    localStorage.setItem("safepath_profile", JSON.stringify(profile));
    setSaved(true);
    toast.success(t("profile_saved"));
    setTimeout(() => setSaved(false), 2000);
  };

  const updateField = (field: keyof UserProfile, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SafePathHeader />
      <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        {/* Google Sign-In */}
        <div className="rounded-lg border border-border bg-card p-4">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="h-10 w-10 rounded-full" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.user_metadata?.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => { signOut(); toast.success("Signed out"); }}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("sos_cancel") || "Sign Out"}
              </button>
            </div>
          ) : (
            <button
              onClick={async () => {
                setSigningIn(true);
                const result = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (result.error) {
                  toast.error("Sign-in failed");
                  setSigningIn(false);
                  return;
                }
                if (result.redirected) return;
                setSigningIn(false);
              }}
              disabled={signingIn || loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {signingIn ? "Signing in..." : "Sign in with Google"}
            </button>
          )}
        </div>

        {/* Profile Form */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <User className="h-4 w-4 text-primary" />
            {t("profile_title")}
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("full_name")}</label>
              <input value={profile.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("age")}</label>
                <input type="number" value={profile.age} onChange={(e) => updateField("age", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("blood_type")}</label>
                <div className="relative">
                  <select value={profile.bloodType} onChange={(e) => updateField("bloodType", e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">—</option>
                    {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("medical_conditions")}</label>
              <textarea value={profile.medicalConditions} onChange={(e) => updateField("medicalConditions", e.target.value)} rows={2} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("allergies")}</label>
              <input value={profile.allergies} onChange={(e) => updateField("allergies", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="border-t border-border pt-3">
              <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold text-foreground">
                <Phone className="h-3 w-3 text-danger" />
                {t("emergency_contact_name")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder={t("full_name")} value={profile.emergencyContactName} onChange={(e) => updateField("emergencyContactName", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <input placeholder={t("emergency_contact_phone")} value={profile.emergencyContactPhone} onChange={(e) => updateField("emergencyContactPhone", e.target.value)} className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">{t("country")}</label>
              <div className="relative">
                <select value={profile.country} onChange={(e) => updateField("country", e.target.value)} className="w-full appearance-none rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  {emergencyContactsByCountry.map((c) => <option key={c.code} value={c.country}>{c.country}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saved ? t("profile_saved") : t("save_profile")}
            </button>
          </div>
        </div>

        {/* Emergency Contacts for Selected Country */}
        {countryContacts && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Shield className="h-4 w-4 text-danger" />
              {t("emergency_contacts")} — {countryContacts.country}
            </h2>
            <div className="space-y-2">
              {countryContacts.contacts.map((contact, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{contact.name}</span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${contact.type === "government" ? "bg-accent/20 text-accent" : "bg-safe/20 text-safe"}`}>
                        {contact.type === "government" ? t("government") : t("ngo")}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{contact.description}</p>
                  </div>
                  <a href={`tel:${contact.number}`} className="ml-2 flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                    <Phone className="h-3 w-3" />
                    {contact.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
