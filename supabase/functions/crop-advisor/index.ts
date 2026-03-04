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

const PLANT_DISEASE_KNOWLEDGE = `
## Comprehensive Plant Disease & Pest Database

### FUNGAL DISEASES:
- **Early Blight (Alternaria solani)**: Concentric ring spots on older leaves. Crops: Tomato, Potato, Brinjal. Treatment: Mancozeb 75 WP @ 2g/L, Chlorothalonil 75 WP @ 2g/L
- **Late Blight (Phytophthora infestans)**: Water-soaked lesions, white mold underneath. Crops: Tomato, Potato. Treatment: Metalaxyl + Mancozeb @ 2.5g/L, Cymoxanil + Mancozeb
- **Powdery Mildew (Erysiphe/Oidium)**: White powdery coating on leaves. Crops: Cucurbits, Okra, Mango. Treatment: Sulfur 80 WP @ 3g/L, Hexaconazole 5 EC @ 1ml/L
- **Downy Mildew (Peronospora/Pseudoperonospora)**: Yellow patches upper surface, gray-purple mold below. Crops: Cucurbits, Grapes, Onion. Treatment: Metalaxyl 8% + Mancozeb 64% @ 2.5g/L
- **Anthracnose (Colletotrichum)**: Dark sunken lesions on fruits/leaves. Crops: Mango, Chilli, Bean. Treatment: Carbendazim 50 WP @ 1g/L, Copper oxychloride @ 3g/L
- **Fusarium Wilt (Fusarium oxysporum)**: Yellowing, wilting from one side. Crops: Tomato, Banana, Cotton. Treatment: Carbendazim drench @ 1g/L, Trichoderma soil application
- **Cercospora Leaf Spot**: Small circular spots with gray center. Crops: Rice, Groundnut, Beetroot. Treatment: Carbendazim @ 1g/L, Propiconazole @ 1ml/L
- **Rust (Puccinia/Uromyces)**: Orange-brown pustules on leaves. Crops: Wheat, Groundnut, Soybean. Treatment: Propiconazole 25 EC @ 1ml/L, Mancozeb @ 2.5g/L
- **Blast (Magnaporthe oryzae)**: Diamond-shaped spots on leaves, neck rot. Crops: Rice, Ragi. Treatment: Tricyclazole 75 WP @ 0.6g/L, Isoprothiolane 40 EC @ 1.5ml/L
- **Sheath Blight (Rhizoctonia solani)**: Irregular lesions on leaf sheath. Crops: Rice. Treatment: Hexaconazole 5 EC @ 2ml/L, Validamycin 3L @ 2ml/L
- **Smut (Ustilago)**: Black sooty masses replacing grain. Crops: Wheat, Maize, Sugarcane. Treatment: Seed treatment with Carboxin + Thiram @ 2g/kg
- **Damping Off (Pythium/Rhizoctonia)**: Seedling collapse at soil line. Crops: All vegetables. Treatment: Captan @ 2g/L drench, Metalaxyl seed treatment
- **Leaf Curl (Taphrina)**: Leaf puckering and curling with thickening. Crops: Peach, Chilli. Treatment: Copper oxychloride @ 3g/L before bud break
- **Sigatoka (Mycosphaerella)**: Yellow streaks becoming brown spots on banana. Crops: Banana. Treatment: Propiconazole @ 1ml/L, Mancozeb @ 2.5g/L

### BACTERIAL DISEASES:
- **Bacterial Leaf Blight (Xanthomonas oryzae)**: Water-soaked streaks, grayish-white lesions. Crops: Rice. Treatment: Streptocycline @ 0.01%, Copper oxychloride @ 3g/L
- **Bacterial Wilt (Ralstonia solanacearum)**: Rapid wilting, brown vascular tissue. Crops: Tomato, Potato, Brinjal, Ginger. Treatment: No cure; remove infected plants, Bleaching powder 10g/pit
- **Citrus Canker (Xanthomonas citri)**: Raised corky lesions on leaves/fruits. Crops: Citrus. Treatment: Copper oxychloride @ 3g/L, Streptocycline @ 100ppm
- **Black Rot (Xanthomonas campestris)**: V-shaped yellow lesions from leaf margin. Crops: Cabbage, Cauliflower. Treatment: Copper oxychloride @ 3g/L, hot water seed treatment

### VIRAL DISEASES:
- **Yellow Mosaic Virus (YMV)**: Bright yellow mosaic pattern on leaves. Crops: Soybean, Mung bean, Okra. Treatment: Control whitefly vector with Imidacloprid, remove infected plants
- **Tomato Leaf Curl Virus (ToLCV)**: Upward curling, stunting, small leaves. Crops: Tomato, Chilli. Treatment: Whitefly control, Imidacloprid 17.8 SL, resistant varieties
- **Mosaic Virus (TMV/CMV)**: Light/dark green mosaic pattern. Crops: Tomato, Cucumber, Tobacco. Treatment: Remove infected plants, control aphid vectors
- **Tungro Virus**: Yellow-orange discoloration of rice leaves. Crops: Rice. Treatment: Control green leafhopper vector, resistant varieties (IR36, CO 45)

### MAJOR INSECT PESTS:
- **Aphids**: Colonies on growing tips, transmit viruses. Treatment: Imidacloprid 17.8 SL @ 0.3ml/L, Thiamethoxam 25 WG @ 0.3g/L
- **Whiteflies**: Small white flies under leaves, honeydew, sooty mold. Treatment: Spiromesifen 22.9 SC @ 0.7ml/L, Yellow sticky traps
- **Thrips**: Silvery streaks on leaves, scarring on fruits. Treatment: Fipronil 5 SC @ 1.5ml/L, Spinosad 45 SC @ 0.3ml/L
- **Fruit Borer (Helicoverpa armigera)**: Bore into fruits leaving holes. Crops: Tomato, Cotton, Chickpea. Treatment: Emamectin benzoate 5 SG @ 0.4g/L, Chlorantraniliprole 18.5 SC @ 0.3ml/L
- **Fall Armyworm (Spodoptera frugiperda)**: Windowing damage on maize leaves. Treatment: Emamectin benzoate 5 SG @ 0.4g/L, Spinetoram 11.7 SC @ 0.5ml/L
- **Stem Borer (Scirpophaga incertulas)**: Dead hearts in rice tillers, white ear heads. Treatment: Cartap hydrochloride 4G @ 25 kg/ha, Chlorantraniliprole 0.4 GR
- **Mealybugs**: White cottony masses on stems/leaves. Treatment: Profenophos 50 EC @ 2ml/L, Neem oil @ 5ml/L
- **Red Spider Mite**: Fine webbing, stippling on leaves. Treatment: Dicofol 18.5 EC @ 2.5ml/L, Spiromesifen @ 0.7ml/L
- **Leaf Miner**: Serpentine mines on leaves. Treatment: Abamectin 1.9 EC @ 0.5ml/L, Cyromazine 75 WP @ 0.3g/L
- **Root Knot Nematode**: Gall formation on roots, stunted growth. Treatment: Carbofuran 3G @ 1 kg ai/ha, Paecilomyces lilacinus

### DEFICIENCY SYMPTOMS (not pests but commonly confused):
- **Nitrogen deficiency**: General yellowing starting from older leaves
- **Phosphorus deficiency**: Purple/reddish discoloration
- **Potassium deficiency**: Scorching of leaf edges
- **Iron deficiency (Chlorosis)**: Yellowing of young leaves with green veins
- **Zinc deficiency**: Small leaves, interveinal chlorosis
- **Calcium deficiency**: Blossom end rot in tomato
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
        // CNN classification with HuggingFace - run in parallel with fast timeout
        let hfClassification = "";
        cnnScores = [];
        if (data.imageBase64) {
          const HF_API_KEY = Deno.env.get("HUGGINGFACE_API_KEY");
          if (HF_API_KEY) {
            try {
              const base64Data = data.imageBase64.replace(/^data:image\/\w+;base64,/, "");
              const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

              // Use a reliable, well-maintained plant disease model
              const hfResponse = await fetch(
                "https://api-inference.huggingface.co/models/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification",
                {
                  method: "POST",
                  headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/octet-stream" },
                  body: binaryData,
                  signal: AbortSignal.timeout(8000),
                }
              );
              if (hfResponse.ok) {
                const hfResult = await hfResponse.json();
                if (Array.isArray(hfResult) && hfResult.length > 0) {
                  cnnScores = hfResult.slice(0, 6).map((r: any) => ({ label: r.label, score: r.score }));
                  const top5 = cnnScores.map(r => `${r.label} (${(r.score * 100).toFixed(1)}%)`).join(", ");
                  hfClassification = `\n\nCNN Image Classification Results (Plant Disease Model): ${top5}`;
                  console.log("HuggingFace classification:", top5);
                }
              } else {
                const errStatus = hfResponse.status;
                console.error("HuggingFace API error:", errStatus);
                // Try fallback model
                try {
                  const fallbackResponse = await fetch(
                    "https://api-inference.huggingface.co/models/nateraw/vit-base-beans",
                    {
                      method: "POST",
                      headers: { "Authorization": `Bearer ${HF_API_KEY}`, "Content-Type": "application/octet-stream" },
                      body: binaryData,
                      signal: AbortSignal.timeout(6000),
                    }
                  );
                  if (fallbackResponse.ok) {
                    const fbResult = await fallbackResponse.json();
                    if (Array.isArray(fbResult) && fbResult.length > 0) {
                      cnnScores = fbResult.slice(0, 6).map((r: any) => ({ label: r.label, score: r.score }));
                      hfClassification = `\n\nCNN fallback classification: ${cnnScores.map(r => `${r.label} (${(r.score * 100).toFixed(1)}%)`).join(", ")}`;
                    }
                  }
                } catch { /* ignore fallback failure */ }
              }
            } catch (hfErr) {
              console.error("HuggingFace classification failed:", hfErr);
            }
          }
        }

        systemPrompt = `You are a world-class plant pathologist, entomologist, and agricultural disease diagnostics expert. You have extensive training in identifying ALL plant diseases including fungal, bacterial, viral diseases, nutrient deficiencies, and insect pest damage across ALL crops worldwide.

${PLANT_DISEASE_KNOWLEDGE}

${ICAR_KNOWLEDGE}

## CRITICAL INSTRUCTIONS:
1. You MUST identify the specific disease/pest by its proper name. NEVER say "Unknown disease" or "unidentified".
2. If an image is provided, carefully analyze visual symptoms: leaf color, spots, patterns, lesions, insect damage, wilting patterns, mold, pustules, etc.
3. If CNN classification results are provided, use them as a strong hint but also apply your own visual analysis.
4. Even if you're uncertain, provide your BEST diagnosis with the most likely disease name. Give confidence score accordingly (e.g., 0.6 for moderate certainty).
5. Always provide actionable treatment recommendations with specific chemical names and dosages.
6. If the image shows a healthy plant, say "Healthy Plant - No disease detected" with confidence 0.95.
7. If symptoms match nutrient deficiency rather than disease, identify it as such (e.g., "Nitrogen Deficiency", "Iron Chlorosis").

RESPOND ONLY in ${langName} language.

Return a JSON object with these exact fields:
{
  "pest": "Exact disease/pest name",
  "confidence": 0.85,
  "severity": "low|medium|high|critical",
  "description": "Brief description of the disease and how it affects the crop",
  "treatment": ["Chemical treatment 1 with dosage", "Chemical treatment 2 with dosage"],
  "organic_alternatives": ["Organic method 1", "Organic method 2"],
  "prevention": ["Prevention tip 1", "Prevention tip 2", "Prevention tip 3"]
}`;

        userPrompt = `Identify the disease/pest affecting this crop:
Crop: ${data.crop || 'Not specified'}
Symptoms described by farmer: ${data.symptoms || 'See image'}
Affected Part: ${data.affectedPart || 'Leaves'}
Spread Pattern: ${data.spread || 'Not specified'}
Duration: ${data.duration || 'Not specified'}${hfClassification}

IMPORTANT: You MUST provide a specific disease/pest name. Analyze carefully and give your best diagnosis.`;

        if (data.imageBase64) {
          messages = [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                { type: "text", text: userPrompt + "\n\nAnalyze the attached crop image carefully. Look at leaf color, spots, patterns, texture, holes, wilting, mold, insects etc. to identify the exact disease or pest." },
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

    // Use gemini-2.5-pro for image-based pest detection (best vision model), flash for everything else
    const model = (type === "pest_detection" && data.imageBase64) 
      ? "google/gemini-2.5-pro" 
      : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: type === "pest_detection" ? 0.3 : 0.7,
        max_tokens: type === "pest_detection" ? 4000 : 3000,
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
