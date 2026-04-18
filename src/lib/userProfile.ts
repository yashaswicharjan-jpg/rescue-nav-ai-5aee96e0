import { supabase } from "@/integrations/supabase/client";

export interface UserProfileContext {
  full_name?: string;
  phone_number?: string;
  blood_group?: string;
  medical_conditions?: string;
  allergies?: string;
  home_location?: string;
  country?: string;
  emergency_contacts?: Array<{ name: string; phone: string }>;
}

/** Fetch profile from Supabase (if logged in) or localStorage fallback. Used to personalize AI. */
export async function getUserProfileContext(): Promise<UserProfileContext> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        return {
          full_name: data.full_name ?? undefined,
          phone_number: data.phone_number ?? undefined,
          blood_group: data.blood_group ?? undefined,
          medical_conditions: data.medical_conditions ?? undefined,
          allergies: data.allergies ?? undefined,
          home_location: data.home_location ?? undefined,
          country: data.country ?? undefined,
          emergency_contacts: [
            { name: data.emergency_contact_1_name ?? "", phone: data.emergency_contact_1_phone ?? "" },
            { name: data.emergency_contact_2_name ?? "", phone: data.emergency_contact_2_phone ?? "" },
            { name: data.emergency_contact_3_name ?? "", phone: data.emergency_contact_3_phone ?? "" },
          ].filter((c) => c.name || c.phone),
        };
      }
    }
  } catch (e) {
    // ignore — fall back to localStorage
  }

  const stored = localStorage.getItem("safepath_profile");
  if (stored) {
    try {
      const p = JSON.parse(stored);
      return {
        full_name: p.fullName,
        blood_group: p.bloodType,
        medical_conditions: p.medicalConditions,
        allergies: p.allergies,
        country: p.country,
        emergency_contacts: p.emergencyContactName
          ? [{ name: p.emergencyContactName, phone: p.emergencyContactPhone || "" }]
          : [],
      };
    } catch {
      // ignore
    }
  }
  return {};
}

/** Compact summary of emergency contacts with phone. */
export function getEmergencyContacts(profile: UserProfileContext): Array<{ name: string; phone: string; relationship?: string }> {
  return (profile.emergency_contacts || []).filter((c) => c.name);
}
