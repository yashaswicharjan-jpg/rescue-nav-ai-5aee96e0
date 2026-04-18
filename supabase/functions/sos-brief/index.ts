const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, location } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const name = profile?.full_name || "Unknown user";
    const blood = profile?.blood_group || "Unknown";
    const conditions = profile?.medical_conditions || "None reported";
    const allergies = profile?.allergies || "None reported";
    const loc = location ? `${location.lat?.toFixed(4)}, ${location.lng?.toFixed(4)}` : "Unknown";

    const prompt = `User ${name} has triggered SOS.
Location: ${loc}
Blood group: ${blood}
Medical conditions: ${conditions}
Allergies: ${allergies}

Generate a 3-step IMMEDIATE ACTION PLAN for emergency responders arriving at this location.
Format as markdown:

## 🚑 Responder Brief
**Patient:** brief profile in 1 line.

### Step 1
Action.

### Step 2
Action.

### Step 3
Action.

Keep each step under 15 words. Be direct.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an emergency dispatch AI generating responder briefs." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI brief failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const brief = data.choices?.[0]?.message?.content || "## 🚑 Brief unavailable\nProceed with standard emergency response.";

    return new Response(JSON.stringify({ brief }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sos-brief error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
      brief: "## 🚑 Brief unavailable\nProceed with standard emergency response.",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
