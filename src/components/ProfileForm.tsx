import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { emergencyContactsByCountry } from "@/lib/emergencyContacts";
import { User, Phone, Heart, Save, Check, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface ProfileData {
  full_name: string;
  phone_number: string;
  email: string;
  blood_group: string;
  medical_conditions: string;
  allergies: string;
  home_location: string;
  country: string;
  emergency_contact_1_name: string;
  emergency_contact_1_phone: string;
  emergency_contact_2_name: string;
  emergency_contact_2_phone: string;
  emergency_contact_3_name: string;
  emergency_contact_3_phone: string;
}

const emptyProfile: ProfileData = {
  full_name: "", phone_number: "", email: "", blood_group: "",
  medical_conditions: "", allergies: "", home_location: "", country: "United States",
  emergency_contact_1_name: "", emergency_contact_1_phone: "",
  emergency_contact_2_name: "", emergency_contact_2_phone: "",
  emergency_contact_3_name: "", emergency_contact_3_phone: "",
};

export const ProfileForm = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      // Load from localStorage as fallback
      const stored = localStorage.getItem("safepath_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...emptyProfile,
          full_name: parsed.fullName || "",
          phone_number: parsed.emergencyContactPhone || "",
          email: "",
          blood_group: parsed.bloodType || "",
          medical_conditions: parsed.medicalConditions || "",
          allergies: parsed.allergies || "",
          country: parsed.country || "United States",
          emergency_contact_1_name: parsed.emergencyContactName || "",
          emergency_contact_1_phone: parsed.emergencyContactPhone || "",
        });
      }
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setProfile({
          full_name: data.full_name || "",
          phone_number: data.phone_number || "",
          email: data.email || "",
          blood_group: data.blood_group || "",
          medical_conditions: data.medical_conditions || "",
          allergies: data.allergies || "",
          home_location: data.home_location || "",
          country: data.country || "United States",
          emergency_contact_1_name: data.emergency_contact_1_name || "",
          emergency_contact_1_phone: data.emergency_contact_1_phone || "",
          emergency_contact_2_name: data.emergency_contact_2_name || "",
          emergency_contact_2_phone: data.emergency_contact_2_phone || "",
          emergency_contact_3_name: data.emergency_contact_3_name || "",
          emergency_contact_3_phone: data.emergency_contact_3_phone || "",
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...profile,
        }, { onConflict: "user_id" });

      if (error) {
        toast.error("Failed to save profile");
        setSaving(false);
        return;
      }
    }
    // Always save to localStorage as offline backup
    localStorage.setItem("safepath_profile", JSON.stringify({
      fullName: profile.full_name,
      bloodType: profile.blood_group,
      medicalConditions: profile.medical_conditions,
      allergies: profile.allergies,
      country: profile.country,
      emergencyContactName: profile.emergency_contact_1_name,
      emergencyContactPhone: profile.emergency_contact_1_phone,
    }));

    setSaving(false);
    setSaved(true);
    toast.success(t("profile_saved"));
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (field: keyof ProfileData, value: string) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const inputCls = "w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-sm text-muted-foreground">{t("loading_profile")}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Personal Info */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <User className="h-5 w-5 text-primary" />
          {t("profile_title")}
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("full_name")}</label>
            <input value={profile.full_name} onChange={(e) => update("full_name", e.target.value)} className={inputCls} placeholder="John Doe" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("phone_number")}</label>
              <input type="tel" value={profile.phone_number} onChange={(e) => update("phone_number", e.target.value)} className={inputCls} placeholder="+1 234 567 8900" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("email")}</label>
              <input type="email" value={profile.email} onChange={(e) => update("email", e.target.value)} className={inputCls} placeholder="email@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("blood_type")}</label>
              <div className="relative">
                <select value={profile.blood_group} onChange={(e) => update("blood_group", e.target.value)} className={`${inputCls} appearance-none`}>
                  <option value="">—</option>
                  {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("country")}</label>
              <div className="relative">
                <select value={profile.country} onChange={(e) => update("country", e.target.value)} className={`${inputCls} appearance-none`}>
                  {emergencyContactsByCountry.map((c) => <option key={c.code} value={c.country}>{c.country}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("medical_conditions")}</label>
            <textarea value={profile.medical_conditions} onChange={(e) => update("medical_conditions", e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Diabetes, Asthma..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("allergies")}</label>
            <input value={profile.allergies} onChange={(e) => update("allergies", e.target.value)} className={inputCls} placeholder="Penicillin, Peanuts..." />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">{t("home_location")}</label>
            <input value={profile.home_location} onChange={(e) => update("home_location", e.target.value)} className={inputCls} placeholder="123 Main St, City" />
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="rounded-xl border border-danger/30 bg-card p-4">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-foreground">
          <Phone className="h-5 w-5 text-danger" />
          {t("emergency_contacts")}
        </h2>
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-lg border border-border bg-secondary/50 p-3">
              <p className="mb-2 text-xs font-bold text-muted-foreground">
                {n === 1 ? t("emergency_contact_name") : t(`emergency_contact_${n}` as any)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={(profile as any)[`emergency_contact_${n}_name`]}
                  onChange={(e) => update(`emergency_contact_${n}_name` as keyof ProfileData, e.target.value)}
                  className={inputCls}
                  placeholder={t("full_name")}
                />
                <input
                  type="tel"
                  value={(profile as any)[`emergency_contact_${n}_phone`]}
                  onChange={(e) => update(`emergency_contact_${n}_phone` as keyof ProfileData, e.target.value)}
                  className={inputCls}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-5 w-5" /> : <Save className="h-5 w-5" />}
        {saving ? t("loading_profile") : saved ? t("profile_saved") : t("save_profile")}
      </button>

      {!user && (
        <p className="text-center text-xs text-muted-foreground">{t("login_to_save")}</p>
      )}
    </div>
  );
};
