import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu",
  kn: "Kannada", bn: "Bengali", pa: "Punjabi", mr: "Marathi",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
- ICAR recommended practices

## Tamil Nadu Specific Knowledge:
### Rice Varieties: ADT 36 (110d), ADT 43 (135d), ADT 45 (105d), CO 51 (130d), CO 52 (150d), BPT 5204 Samba Mahsuri (145d), IR 20 (100d), Ponni (135d)
### Seasons: Kuruvai (Jun-Sep), Samba (Aug-Jan), Navarai (Jan-Apr)
### Key Crops by District:
- Thanjavur/Tiruvarur/Nagapattinam: Rice (Cauvery delta), Banana
- Erode/Salem: Turmeric, Groundnut, Cotton
- Coimbatore/Tirupur: Cotton, Coconut, Vegetables
- Kanyakumari: Rubber, Coconut, Banana
- Thiruvallur/Kanchipuram: Paddy, Vegetables, Groundnut
- Nilgiris: Tea, Potato, Carrots, Spices
- Madurai/Dindigul: Cotton, Millets, Vegetables
- Krishnagiri/Dharmapuri: Mango, Tomato, Ragi

### Fertilizer Doses (kg/ha - N:P:K):
- Paddy: 150:50:50 (4 splits), Groundnut: 25:50:75, Cotton: 120:60:60
- Sugarcane: 300:100:150, Maize: 135:62:50, Tomato: 120:80:80
- Banana: 200:60:300, Turmeric: 150:60:108

### Micronutrient Tips:
- Zinc deficiency: ZnSO4 25 kg/ha (common in rice)
- Iron chlorosis: FeSO4 50 kg/ha or 0.5% foliar spray
- Boron: Borax 10 kg/ha for oilseeds, pulses

### Government Schemes:
- PM-KISAN: ₹6,000/year in 3 installments
- PMFBY: Crop insurance with 2% Kharif, 1.5% Rabi premium
- KCC: Credit up to ₹3 lakh at 4% interest
- Soil Health Card: Free testing every 3 years
- eNAM: Online mandi trading platform
- TN State Schemes: Free electricity for farmers, crop loan waiver, subsidized seeds

Communication style:
- Speak in simple, clear ${languageName}
- Use farming terminology farmers understand
- Be encouraging and supportive
- Provide actionable, practical advice
- When unsure, recommend consulting local agriculture officers

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
          ...messages.slice(-10),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI request failed: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(JSON.stringify({
      error: "An internal error occurred. Please try again later.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
