import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  bn: "Bengali",
  pa: "Punjabi",
  mr: "Marathi",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const languageName = LANGUAGE_NAMES[language] || "English";

    const systemPrompt = `You are "Crop Wise Assistant", a friendly and knowledgeable AI farming advisor for Indian farmers.

Your expertise includes:
- Crop selection and planning (Kharif, Rabi, Zaid seasons)
- Soil health and fertilizer management (STCR approach)
- Pest and disease identification and treatment
- Irrigation and water management
- Market prices and selling strategies
- Government schemes (PM-KISAN, PMFBY, Soil Health Card, KCC, eNAM)
- Weather-based farming advice

Communication style:
- Speak in simple, clear ${languageName}
- Use farming terminology farmers understand
- Be encouraging and supportive
- Provide actionable, practical advice
- When unsure, recommend consulting local agriculture officers

Key knowledge:
- PM-KISAN: ₹6,000/year in 3 installments
- PMFBY: Crop insurance with 2% Kharif, 1.5% Rabi premium
- KCC: Credit up to ₹3 lakh at 4% interest
- Soil Health Card: Free testing every 3 years
- eNAM: Online mandi trading platform

Always be helpful, culturally sensitive, and focused on practical farming solutions.
Respond in ${languageName} language.`;

    console.log(`AI Assistant request in language: ${language}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
