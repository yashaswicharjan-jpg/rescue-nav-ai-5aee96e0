import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Phone, User, ChevronRight } from "lucide-react";

export const EmergencyInfoCard = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("full_name, blood_group, medical_conditions, emergency_contact_1_name, emergency_contact_1_phone")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setProfile(data);
        });
    } else {
      const stored = localStorage.getItem("safepath_profile");
      if (stored) {
        const p = JSON.parse(stored);
        setProfile({
          full_name: p.fullName,
          blood_group: p.bloodType,
          medical_conditions: p.medicalConditions,
          emergency_contact_1_name: p.emergencyContactName,
          emergency_contact_1_phone: p.emergencyContactPhone,
        });
      }
    }
  }, [user]);

  if (!profile?.full_name) return null;

  return (
    <button
      onClick={() => navigate("/profile")}
      className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
        <User className="h-5 w-5 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-foreground">{profile.full_name}</p>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          {profile.blood_group && (
            <span className="flex items-center gap-0.5">
              <Heart className="h-3 w-3 text-danger" />
              {profile.blood_group}
            </span>
          )}
          {profile.emergency_contact_1_name && (
            <span className="flex items-center gap-0.5">
              <Phone className="h-3 w-3 text-safe" />
              {profile.emergency_contact_1_name}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
};
