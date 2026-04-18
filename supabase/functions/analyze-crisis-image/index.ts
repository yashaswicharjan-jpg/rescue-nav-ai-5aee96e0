const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an emergency crisis response AI. A person is in danger and has sent you a photo.
Analyze the image immediately and provide your reply in markdown with these sections:

## 🚨 Situation
1-2 direct sentences on the danger you see.

## ✅ Do Now
Numbered list of exact actions, simple words.

## ⛔ Avoid
One thing they must NOT do.

## 📞 Call
Exact emergency number based on context (112 / 911 / 999 or specialized line).

Keep it short, clear, life-saving. No jargon. Assume 30 seconds to read.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, mimeType, userText, language, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!imageBase64) throw new Error("imageBase64 required");

    const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;
    const langInstruction = language && language !== "en"
      ? `\n\nIMPORTANT: Respond entirely in language code "${language}".`
      : "";

    const profileContext = profile && (profile.full_name || profile.blood_group || profile.medical_conditions)
      ? `\n\nUSER PROFILE (use to personalize advice — mention conditions/allergies if relevant to the crisis):
- Name: ${profile.full_name || "Unknown"}
- Blood group: ${profile.blood_group || "Unknown"}
- Medical conditions: ${profile.medical_conditions || "None"}
- Allergies: ${profile.allergies || "None"}
- Country: ${profile.country || "Unknown"}`
      : "";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-flash-image-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + langInstruction + profileContext },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              {
                type: "text",
                text: userText?.trim() || "I am in an emergency. Analyze this image and tell me what to do immediately.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in workspace settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content
      || "Unable to analyze image. If in danger, call emergency services immediately: 112 / 911 / 999.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-crisis-image error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Unknown error",
      reply: "Analysis failed. If you are in danger, call emergency services immediately: 112 / 911 / 999.",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
