import { useState, useEffect } from "react";
import { SafePathHeader } from "@/components/SafePathHeader";
import { BottomNav } from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { emergencyContactsByCountry, getContactsByCountry } from "@/lib/emergencyContacts";
import { User, Phone, Heart, Shield, Save, Check, ChevronDown } from "lucide-react";
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
  const [saved, setSaved] = useState(false);

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
