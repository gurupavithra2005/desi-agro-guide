import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Indian states and their common markets
const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state, district, commodity } = await req.json();
    
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try fetching from data.gov.in API (Agmarknet)
    const API_KEY = Deno.env.get("DATA_GOV_API_KEY");
    if (!API_KEY) {
      throw new Error("DATA_GOV_API_KEY is not configured");
    }
    const baseUrl = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";
    
    const params = new URLSearchParams({
      "api-key": API_KEY,
      format: "json",
      limit: "100",
      offset: "0",
    });

    if (state) params.append("filters[state.keyword]", state);
    if (district) params.append("filters[district]", district);
    if (commodity) params.append("filters[commodity]", commodity);

    console.log(`Fetching market prices: state=${state}, district=${district}, commodity=${commodity}`);

    let records: any[] = [];
    let fetchedFromAPI = false;

    try {
      const apiResponse = await fetch(`${baseUrl}?${params.toString()}`, {
        headers: { "Accept": "application/json" },
      });

      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        if (apiData.records && apiData.records.length > 0) {
          records = apiData.records;
          fetchedFromAPI = true;
          console.log(`Fetched ${records.length} records from data.gov.in API`);
        }
      }
    } catch (apiError) {
      console.error("data.gov.in API error:", apiError);
    }

    // If API fetch succeeded, upsert into our database
    if (fetchedFromAPI && records.length > 0) {
      const pricesToInsert = records.map((r: any) => ({
        crop_name: r.commodity || r.Commodity || "Unknown",
        market_name: r.market || r.Market || "Unknown",
        state: r.state || r.State || state || "Unknown",
        district: r.district || r.District || district || null,
        min_price: parseFloat(r.min_price || r.Min_x0020_Price || "0"),
        max_price: parseFloat(r.max_price || r.Max_x0020_Price || "0"),
        modal_price: parseFloat(r.modal_price || r.Modal_x0020_Price || "0"),
        unit: "quintal",
        price_date: new Date().toISOString().split("T")[0],
      }));

      // Calculate change percentages by comparing with existing prices
      for (const price of pricesToInsert) {
        const { data: existing } = await supabase
          .from("market_prices")
          .select("modal_price")
          .eq("crop_name", price.crop_name)
          .eq("market_name", price.market_name)
          .order("price_date", { ascending: false })
          .limit(1);

        if (existing && existing.length > 0) {
          price.previous_price = existing[0].modal_price;
          if (existing[0].modal_price > 0) {
            price.change_percent = ((price.modal_price - existing[0].modal_price) / existing[0].modal_price) * 100;
          }
        }
      }

      // Insert new prices
      const { error: insertError } = await supabase
        .from("market_prices")
        .insert(pricesToInsert);

      if (insertError) {
        console.error("Insert error:", insertError);
      } else {
        console.log(`Inserted ${pricesToInsert.length} price records`);
      }
    }

    // Always return data from our database (freshly updated or existing)
    let query = supabase
      .from("market_prices")
      .select("*")
      .order("price_date", { ascending: false })
      .limit(100);

    if (state) query = query.eq("state", state);
    if (district) query = query.eq("district", district);
    if (commodity) query = query.ilike("crop_name", `%${commodity}%`);

    const { data, error } = await query;

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      data: data || [],
      source: fetchedFromAPI ? "live_api" : "cached",
      total: data?.length || 0,
      states: INDIAN_STATES,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fetch market prices error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
