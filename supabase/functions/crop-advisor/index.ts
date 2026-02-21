import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ICAR_KNOWLEDGE = `
## ICAR Tamil Nadu Kharif Advisory Knowledge Base

### Rice Varieties for Tamil Nadu:
- **ADT 36**: Short duration (110 days), suitable for Samba season, yield 5-6 t/ha
- **ADT 43**: Medium duration (135 days), fine grain, yield 5.5-6.5 t/ha
- **ADT 45**: Short duration (105 days), suitable for late sowing
- **CO 51**: Medium duration (130 days), blast resistant, yield 6-7 t/ha
- **CO 52**: Long duration (150 days), premium grain quality
- **BPT 5204 (Samba Mahsuri)**: Fine grain, 145 days, yield 5-6 t/ha
- **IR 20**: Short duration (100 days), resistant to BPH
- **Ponni**: Traditional variety, aromatic, 135 days

### Soil-Crop-Fertilizer Mapping (per hectare):
| Crop | N (kg) | P2O5 (kg) | K2O (kg) | Soil Types |
|------|--------|-----------|----------|------------|
| Paddy | 150 | 50 | 50 | Alluvial, Clay, Loamy |
| Groundnut | 25 | 50 | 75 | Red, Sandy Loam, Laterite |
| Cotton | 120 | 60 | 60 | Black, Alluvial |
| Sugarcane | 300 | 100 | 150 | Alluvial, Loamy, Black |
| Maize | 135 | 62 | 50 | Loamy, Alluvial, Red |
| Ragi | 60 | 30 | 30 | Red, Laterite, Sandy |
| Tomato | 120 | 80 | 80 | Loamy, Red, Black |
| Onion | 100 | 80 | 60 | Loamy, Alluvial |
| Banana | 200 | 60 | 300 | Alluvial, Loamy |
| Turmeric | 150 | 60 | 108 | Alluvial, Red, Loamy |
| Chilli | 120 | 60 | 60 | Loamy, Sandy Loam |
| Brinjal | 150 | 60 | 50 | Loamy, Alluvial |
| Coconut | 50 | 32 | 120 | Sandy Loam, Laterite, Red |

### Split Application Schedule:
- **Paddy**: Basal (50% P, 50% K) → 21 DAT (25% N) → 42 DAT (50% N) → Panicle (25% N, 50% K)
- **Sugarcane**: Basal (33% N, 100% P, 50% K) → 45 DAP (33% N) → 90 DAP (34% N, 50% K)
- **Cotton**: Basal (25% N, 100% P, 50% K) → 30 DAS (25% N) → 60 DAS (25% N, 50% K) → 90 DAS (25% N)

### Micronutrient Deficiencies:
- **Zinc**: Interveinal chlorosis in young leaves. Apply ZnSO4 @ 25 kg/ha
- **Iron**: Yellowing of young leaves. Apply FeSO4 @ 50 kg/ha or foliar spray 0.5%
- **Boron**: Poor grain filling, hollow stems. Apply Borax @ 10 kg/ha
- **Manganese**: Grey specks in rice. Apply MnSO4 @ 5 kg/ha

### Tamil Nadu Season Calendar:
- **Kuruvai (June-Sep)**: Short duration paddy, pulses
- **Samba (Aug-Jan)**: Main paddy season, long duration varieties
- **Navarai (Jan-Apr)**: Summer paddy, vegetables
- **Kharif (Jun-Oct)**: Cotton, groundnut, millets, pulses
- **Rabi (Oct-Mar)**: Wheat, mustard, gram, vegetables

### Pest Management (ICAR Recommended):
- **BPH in Rice**: Avoid excess N, drain water, apply Imidacloprid 17.8 SL @ 100ml/ha
- **Stem Borer**: Light traps, release Trichogramma @ 5cc/ha, Cartap hydrochloride 4G @ 25 kg/ha
- **Leaf Folder**: Chlorantraniliprole 18.5 SC @ 150ml/ha
- **Blast**: Tricyclazole 75 WP @ 300g/ha
- **Fall Armyworm in Maize**: Emamectin benzoate 5 SG @ 400g/ha, Spinetoram 11.7 SC @ 500ml/ha
- **Fruit Borer in Tomato**: Neem oil 5%, Bt @ 1kg/ha, Chlorantraniliprole
`;

const LANGUAGE_MAP: Record<string, string> = {
  en: 'English', hi: 'Hindi', ta: 'Tamil', te: 'Telugu',
  kn: 'Kannada', bn: 'Bengali', pa: 'Punjabi', mr: 'Marathi',
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

    const langName = LANGUAGE_MAP[language] || "English";
    let systemPrompt = "";
    let userPrompt = "";
    let messages: any[] = [];
    let cnnScores: { label: string; score: number }[] = [];

    switch (type) {
      case "crop_recommendation":
        systemPrompt = `You are an expert Indian agricultural advisor with deep knowledge of ICAR recommendations.
${ICAR_KNOWLEDGE}

Based on the farmer's location, soil, and conditions, recommend the best crops.
For each crop provide: crop_name, local_name, reason, yield, profit_potential (low/medium/high), water_requirement (low/medium/high), growth_duration, fertilizer_dose (N-P-K kg/ha).
Always respond in ${langName}. Format as JSON with "recommendations" array.`;

        userPrompt = `Recommend crops for:
Location: ${data.state || 'Not specified'}, ${data.district || 'Not specified'}
Season: ${data.season || 'Kharif'}
Land Type: ${data.landType || 'Not specified'}
Land Size: ${data.landSize || 'Not specified'} acres
Soil Type: ${data.soilType || 'Not specified'}
Soil pH: ${data.soilPh || 'Not specified'}
N: ${data.nitrogen || 'N/A'} kg/ha, P: ${data.phosphorus || 'N/A'} kg/ha, K: ${data.potassium || 'N/A'} kg/ha
Irrigation: ${data.irrigation || 'Rainfed'}
Previous Crop: ${data.previousCrop || 'Not specified'}

Provide 5-6 recommendations with fertilizer doses.`;
        messages = [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];
        break;

      case "fertilizer_advice":
        systemPrompt = `You are an expert agricultural scientist using STCR approach for Indian farming.
${ICAR_KNOWLEDGE}

Provide precise fertilizer recommendations with split application schedules.
For each fertilizer: type, quantity_kg_per_ha, application_method, timing_days_after_sowing, cost_estimate.
Always respond in ${langName}. Format as JSON with "fertilizers" array and "schedule" array.`;

        userPrompt = `Fertilizer plan for:
Crop: ${data.crop || 'Not specified'}
Land Size: ${data.landSize || 1} acres
Growth Stage: ${data.growthStage || 'Basal'}
pH: ${data.soilPh || 'N/A'}, N: ${data.nitrogen || 'N/A'}, P: ${data.phosphorus || 'N/A'}, K: ${data.potassium || 'N/A'}
Organic Carbon: ${data.organicCarbon || 'N/A'}%
Target Yield: ${data.targetYield || 'Moderate'}
Irrigation: ${data.irrigation || 'Rainfed'}`;
        messages = [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];
        break;

      case "pest_detection": {
        // If image is provided, first classify with Hugging Face CNN model
        let hfClassification = "";
        cnnScores = [];
        if (data.imageBase64) {
          const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
          if (HF_API_KEY) {
            try {
              const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, "");
              const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

              const hfResponse = await fetch(
                "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
                {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/octet-stream" },
                  body: binaryData,
                }
              );
              if (hfResponse.ok) {
                const hfResult = await hfResponse.json();
                if (Array.isArray(hfResult) && hfResult.length > 0) {
                  cnnScores = hfResult.slice(0, 6).map((r: any) => ({ label: r.label, score: r.score }));
                  const top5 = cnnScores.map(r => `${r.label} (${(r.score * 100).toFixed(1)}%)`).join(", ");
                  hfClassification = `\n\nCNN Image Classification Results (MobileNet Plant Disease Model): ${top5}`;
                  console.log("HuggingFace classification:", top5);
                }
              } else {
                console.error("HuggingFace API error:", hfResponse.status, await hfResponse.text());
              }
            } catch (hfErr) {
              console.error("HuggingFace classification failed:", hfErr);
            }
          }
        }

        systemPrompt = `You are an expert plant pathologist and entomologist specializing in Indian crops.
${ICAR_KNOWLEDGE}

When analyzing pest/disease, provide:
1. pest/identification name
2. confidence (0-1)
3. severity (low/medium/high/critical)
4. treatment (array of chemical controls with dosages)
5. organic_alternatives (array)
6. prevention (array)

If CNN classification results are provided, use them to improve your diagnosis accuracy.
Always respond in ${langName}. Format as structured JSON.`;

        userPrompt = `Analyze pest/disease:
Crop: ${data.crop || 'Not specified'}
Symptoms: ${data.symptoms || 'Not described'}
Affected Part: ${data.affectedPart || 'Leaves'}
Spread: ${data.spread || 'Not specified'}
Duration: ${data.duration || 'Not specified'}${hfClassification}`;

        if (data.imageBase64) {
          messages = [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt + "\n\nAnalyze the attached crop image to identify pests/diseases visually." },
                { type: "image_url", image_url: { url: data.imageBase64 } }
              ]
            }
          ];
        } else {
          messages = [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];
        }
        break;
      }

      case "soil_crop_guide":
        systemPrompt = `You are an expert soil scientist and agronomist for Indian agriculture.
${ICAR_KNOWLEDGE}

Given a soil type, provide matching crops with:
- crop_name, suitability_score (1-10), season (Kharif/Rabi/Zaid), water_requirement, 
  fertilizer_n, fertilizer_p, fertilizer_k (all in kg/ha),
  expected_yield, growth_days, tips

Always respond in ${langName}. Format as JSON with "crops" array.`;

        userPrompt = `Recommend crops for:
Soil Type: ${data.soilType}
pH: ${data.soilPh || 'Not tested'}
N: ${data.nitrogen || 'N/A'}, P: ${data.phosphorus || 'N/A'}, K: ${data.potassium || 'N/A'}
Location: ${data.state || 'Tamil Nadu'}, ${data.district || ''}
Season: ${data.season || 'All'}

List 8-10 best matching crops with complete fertilizer doses.`;
        messages = [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }];
        break;

      default:
        throw new Error(`Unknown advisor type: ${type}`);
    }

    console.log(`Processing ${type} request for language: ${language}`);

    const model = data.imageBase64 ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 3000,
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

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    let parsedContent;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      parsedContent = JSON.parse(jsonString);
    } catch {
      parsedContent = { text: content };
    }

    const responsePayload: any = {
      success: true,
      type,
      data: parsedContent,
    };

    // Attach CNN scores for pest_detection
    if (type === "pest_detection" && cnnScores && cnnScores.length > 0) {
      responsePayload.cnn_scores = cnnScores;
    }

    return new Response(JSON.stringify(responsePayload), {
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
