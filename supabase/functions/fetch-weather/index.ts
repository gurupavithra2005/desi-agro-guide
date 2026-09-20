import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// TN district coordinates
const DISTRICT_COORDS: Record<string, { lat: number; lon: number }> = {
  "Thiruvallur": { lat: 13.14, lon: 79.91 },
  "Chennai": { lat: 13.08, lon: 80.27 },
  "Coimbatore": { lat: 11.01, lon: 76.97 },
  "Madurai": { lat: 9.92, lon: 78.12 },
  "Salem": { lat: 11.65, lon: 78.16 },
  "Thanjavur": { lat: 10.79, lon: 79.14 },
  "Tirunelveli": { lat: 8.73, lon: 77.70 },
  "Erode": { lat: 11.34, lon: 77.73 },
  "Tiruchirappalli": { lat: 10.79, lon: 78.69 },
  "Kanchipuram": { lat: 12.83, lon: 79.70 },
  "Vellore": { lat: 12.92, lon: 79.13 },
  "Dindigul": { lat: 10.37, lon: 77.98 },
  "Krishnagiri": { lat: 12.52, lon: 78.21 },
  "Cuddalore": { lat: 11.75, lon: 79.77 },
  "Nagapattinam": { lat: 10.77, lon: 79.84 },
  "Kanyakumari": { lat: 8.08, lon: 77.57 },
  "Nilgiris": { lat: 11.49, lon: 76.73 },
  "Dharmapuri": { lat: 12.13, lon: 78.16 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await authClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { lat, lon, district } = await req.json();
    const API_KEY = Deno.env.get("OPENWEATHER_API_KEY");

    if (!API_KEY) {
      throw new Error("OPENWEATHER_API_KEY is not configured");
    }

    // Use district coords if lat/lon not provided
    let latitude = lat;
    let longitude = lon;
    if (!latitude && district && DISTRICT_COORDS[district]) {
      latitude = DISTRICT_COORDS[district].lat;
      longitude = DISTRICT_COORDS[district].lon;
    }
    if (!latitude) {
      // Default to Thiruvallur
      latitude = 13.14;
      longitude = 79.91;
    }

    // Fetch current weather + 5-day forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      throw new Error(`Weather API error: ${currentRes.status}`);
    }

    const current = await currentRes.json();
    const forecast = await forecastRes.json();

    // Process forecast into daily summaries
    const dailyMap: Record<string, any> = {};
    for (const item of forecast.list) {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { high: -Infinity, low: Infinity, condition: '', icon: '', rainChance: 0, items: [] };
      }
      dailyMap[date].high = Math.max(dailyMap[date].high, item.main.temp_max);
      dailyMap[date].low = Math.min(dailyMap[date].low, item.main.temp_min);
      dailyMap[date].items.push(item);
      if (item.pop > dailyMap[date].rainChance) dailyMap[date].rainChance = item.pop;
      // Use noon weather as representative
      if (item.dt_txt.includes('12:00')) {
        dailyMap[date].condition = item.weather[0].main;
        dailyMap[date].icon = item.weather[0].icon;
      }
    }

    const days = Object.entries(dailyMap).slice(0, 5).map(([date, data]: [string, any]) => {
      const d = new Date(date);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weatherIcons: Record<string, string> = {
        'Clear': '☀️', 'Clouds': '⛅', 'Rain': '🌧️', 'Drizzle': '🌦️',
        'Thunderstorm': '⛈️', 'Snow': '❄️', 'Mist': '🌫️', 'Haze': '🌫️',
      };
      return {
        day: dayNames[d.getDay()],
        date,
        high: Math.round(data.high),
        low: Math.round(data.low),
        condition: data.condition || data.items[0]?.weather[0]?.main || 'Clear',
        icon: weatherIcons[data.condition] || '⛅',
        rainChance: Math.round(data.rainChance * 100),
      };
    });

    // Generate farming insights based on weather
    const insights = [];
    const rainExpected = days.some(d => d.rainChance > 60);
    const highTemp = current.main.temp > 35;
    const humidity = current.main.humidity;

    if (rainExpected) {
      insights.push({ condition: 'Warning', tip: 'Rain expected soon - avoid spraying pesticides. Plan harvesting if crops are ready.' });
    }
    if (highTemp) {
      insights.push({ condition: 'Warning', tip: `High temperature (${Math.round(current.main.temp)}°C) - ensure adequate irrigation. Water crops early morning or evening.` });
    }
    if (humidity > 80) {
      insights.push({ condition: 'Warning', tip: 'High humidity increases fungal disease risk. Monitor crops for blast, blight symptoms.' });
    }
    if (!rainExpected && !highTemp) {
      insights.push({ condition: 'Good', tip: 'Favorable conditions for spraying pesticides and fertilizer application.' });
    }
    if (days[0]?.rainChance < 30) {
      insights.push({ condition: 'Good', tip: 'Low rain chance today - good for field preparation and sowing activities.' });
    }
    if (current.wind?.speed > 20) {
      insights.push({ condition: 'Warning', tip: 'Strong winds - avoid aerial spraying. Stake tall crops like sugarcane, banana.' });
    }

    const result = {
      current: {
        temp: Math.round(current.main.temp),
        feelsLike: Math.round(current.main.feels_like),
        condition: current.weather[0].main,
        description: current.weather[0].description,
        humidity: current.main.humidity,
        windSpeed: Math.round(current.wind.speed * 3.6), // m/s to km/h
        visibility: Math.round((current.visibility || 10000) / 1000),
        sunrise: new Date(current.sys.sunrise * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(current.sys.sunset * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        location: current.name,
      },
      forecast: days,
      insights,
    };

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Weather error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: "An internal error occurred. Please try again later.",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
