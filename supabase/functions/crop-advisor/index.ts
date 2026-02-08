import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "crop_recommendation":
        systemPrompt = `You are an expert Indian agricultural advisor specializing in crop recommendations. 
You must provide recommendations based on:
- Location/climate (rainfall zone, seasons - Kharif vs Rabi vs Zaid)
- Soil data (NPK levels, pH, texture)
- Water availability (rainfed vs irrigated)
- Land type (dry land, wet land, garden land)

For each recommended crop, provide:
1. Crop name (English and local language if applicable)
2. Why it's suitable for the given conditions
3. Expected yield range
4. Profit potential (low/medium/high)
5. Water requirements
6. Growth duration

Always respond in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'te' ? 'Telugu' : language === 'kn' ? 'Kannada' : language === 'bn' ? 'Bengali' : language === 'pa' ? 'Punjabi' : language === 'mr' ? 'Marathi' : 'English'}.
Format your response as structured JSON with a "recommendations" array.`;

        userPrompt = `Based on the following farm details, recommend the best crops to grow:

Location: ${data.state || 'Not specified'}, ${data.district || 'Not specified'}
Season: ${data.season || 'Kharif'}
Land Type: ${data.landType || 'Not specified'}
Land Size: ${data.landSize || 'Not specified'} acres
Soil Type: ${data.soilType || 'Not specified'}
Soil pH: ${data.soilPh || 'Not specified'}
Nitrogen (N): ${data.nitrogen || 'Not specified'} kg/ha
Phosphorus (P): ${data.phosphorus || 'Not specified'} kg/ha
Potassium (K): ${data.potassium || 'Not specified'} kg/ha
Irrigation: ${data.irrigation || 'Rainfed'}
Previous Crop: ${data.previousCrop || 'Not specified'}

Provide 5-6 crop recommendations ranked by suitability.`;
        break;

      case "fertilizer_advice":
        systemPrompt = `You are an expert agricultural scientist specializing in soil health and fertilizer management for Indian farming.
You follow the STCR (Soil Test Crop Response) approach to provide precise fertilizer recommendations.

Key principles:
- Integrate soil test values with target yield
- Balance organic and inorganic fertilizers
- Consider crop-specific NPK requirements
- Recommend split applications for efficiency
- Address micronutrient deficiencies (S, Zn, Fe, etc.)

For each recommendation provide:
1. Fertilizer type (urea, DAP, MOP, etc.)
2. Quantity in kg/hectare
3. Application method
4. Timing (days after sowing)
5. Cost estimate

Always respond in ${language === 'hi' ? 'Hindi' : 'English'}.
Format as structured JSON with "fertilizers" array and "schedule" array.`;

        userPrompt = `Provide fertilizer recommendations for:

Crop: ${data.crop || 'Not specified'}
Land Size: ${data.landSize || 1} acres
Growth Stage: ${data.growthStage || 'Basal'}
Soil Test Results:
- pH: ${data.soilPh || 'Not tested'}
- Nitrogen: ${data.nitrogen || 'Not tested'} kg/ha
- Phosphorus: ${data.phosphorus || 'Not tested'} kg/ha
- Potassium: ${data.potassium || 'Not tested'} kg/ha
- Organic Carbon: ${data.organicCarbon || 'Not tested'}%
Target Yield: ${data.targetYield || 'Moderate'}
Irrigation Type: ${data.irrigation || 'Rainfed'}

Provide complete fertilizer schedule with quantities and timing.`;
        break;

      case "pest_detection":
        systemPrompt = `You are an expert plant pathologist and entomologist specializing in Indian crop diseases and pests.

When analyzing pest/disease descriptions or symptoms, provide:
1. Most likely pest/disease identification
2. Confidence level
3. Severity assessment (low/medium/high/critical)
4. Immediate treatment recommendations
5. Chemical control options with dosages
6. Organic/biological control alternatives
7. Preventive measures for future

Always respond in ${language === 'hi' ? 'Hindi' : 'English'}.
Format as structured JSON.`;

        userPrompt = `Analyze the following pest/disease symptoms:

Crop: ${data.crop || 'Not specified'}
Symptoms: ${data.symptoms || 'Not described'}
Affected Part: ${data.affectedPart || 'Leaves'}
Spread: ${data.spread || 'Not specified'}
Duration: ${data.duration || 'Not specified'}

Identify the pest/disease and provide treatment recommendations.`;
        break;

      default:
        throw new Error(`Unknown advisor type: ${type}`);
    }

    console.log(`Processing ${type} request for language: ${language}`);

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    // Try to parse as JSON, otherwise return as text
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString);
    } catch {
      parsedContent = { text: content };
    }

    return new Response(JSON.stringify({
      success: true,
      type,
      data: parsedContent,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Crop advisor error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
