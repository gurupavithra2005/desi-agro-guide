

# Comprehensive Feature Implementation Plan

## Overview
This plan covers 6 major feature areas: Price Comparison across TN districts, Soil-based Crop Recommendation, enhanced Pest Detection, Weather API integration, more Thiruvallur market data, and ICAR advisory knowledge integration. All features use existing Lovable AI + Agmarknet API infrastructure.

---

## 1. Price Comparison Feature (New Page Section in MarketPrices.tsx)

Add a "Compare Prices Across Districts" tab/section to the Market Prices page:

- **New UI Component**: A comparison view where the farmer selects a crop (e.g., "Tomato") and sees a table/card grid showing that crop's modal price across all 38 TN districts side by side
- Sorted by price (lowest to highest) so farmers know WHERE to sell for the best price
- Highlight the best market (highest price) with a green badge and worst (lowest price) with red
- Data comes from the existing `market_prices` table filtered by `crop_name` and `state = 'Tamil Nadu'`
- Add a Recharts bar chart comparing prices visually across districts

**Files changed**: `src/pages/MarketPrices.tsx`

---

## 2. Soil-Based Crop Recommendation (New Page)

Create a dedicated soil-based recommendation page where farmers:

1. Select their **soil type** from a visual picker: Black Soil, Alluvial, Red Soil, Sandy/Sandy Loam, Laterite, Loamy Soil
2. Optionally enter soil pH and NPK values
3. See **matching crops** with:
   - Suitability score
   - Fertilizer advice (Urea/DAP/Potash doses from the user-provided chart)
   - Season suitability (Kharif/Rabi/Zaid)
   - Water requirement and expected yield

This uses the seeded `crops` table (65 entries with `suitable_land_types`) combined with the ICAR knowledge embedded in the crop-advisor edge function. The AI prompt in `crop-advisor` will be enhanced with the complete soil-crop mapping and fertilizer dosage charts from the user's data.

**Files changed**: 
- New file: `src/pages/SoilCropGuide.tsx`
- `src/App.tsx` (add route)
- `src/pages/Dashboard.tsx` (add feature card)
- `supabase/functions/crop-advisor/index.ts` (enhanced prompts with ICAR data)

---

## 3. Weather API Integration (OpenWeatherMap)

Replace mock weather data with live OpenWeatherMap API:

- Create a new edge function `fetch-weather` that calls OpenWeatherMap's free API (no key needed for basic forecasts, or use the free tier with a publishable key)
- Returns current conditions + 5-day forecast for the farmer's location (lat/lng from profile or district center coordinates)
- Add farming-specific insights based on weather (e.g., "Don't spray pesticide today - rain expected")
- Update Dashboard weather card and Weather page to use live data

**Files changed**:
- New file: `supabase/functions/fetch-weather/index.ts`
- `src/pages/Weather.tsx` (replace mock data)
- `src/pages/Dashboard.tsx` (live weather widget)
- `supabase/config.toml` (add function config)

**Note**: OpenWeatherMap requires an API key. I will set this up as a secret. The free tier allows 1000 calls/day which is sufficient.

---

## 4. Enhanced Pest Detection with Image Analysis

Upgrade pest detection to use Lovable AI's Gemini vision model for actual image analysis:

- When a farmer uploads a crop photo, send the base64 image to the `crop-advisor` edge function
- Use `google/gemini-2.5-flash` (multimodal) to analyze the image and identify pests/diseases
- Add more crops to the dropdown (all vegetables, fruits, millets from the user's list)
- Include ICAR-recommended treatment protocols from the Kharif Advisory PDF

**Files changed**:
- `supabase/functions/crop-advisor/index.ts` (add image analysis branch)
- `src/pages/PestDetection.tsx` (send image data, expand crop list)

---

## 5. More Thiruvallur Market Data + All TN Districts

Seed additional market prices for Thiruvallur and other underserved TN districts:

- Add missing crops: Ragi, Bajra, Jowar, Sesame, Cowpea, Field Pea, Barley, Oats, Watermelon, Muskmelon, Cucumber, Pumpkin, Capsicum, Beans, Curry Leaves, Coriander, Mint, Pomegranate, Lemon, Grapes, Guava (fresh), Sweet Potato, Tapioca
- Ensure every TN district has at least 15+ crop entries
- Add more realistic price variation between districts

**Action**: Database insert of ~200+ additional records

---

## 6. ICAR Advisory Knowledge Integration

Enhance the `crop-advisor` and `ai-assistant` edge functions with rich ICAR knowledge:

- Embed Tamil Nadu-specific Kharif advisories (rice varieties like ADT 36, ADT 43, CO 51; recommended practices from the PDF)
- Include the complete soil-crop-fertilizer mapping from the user's tables
- Add season-wise cropping patterns (Kharif/Rabi/Zaid) with specific variety recommendations
- Include micronutrient deficiency symptoms and remedies (Zinc, Iron, Boron)

**Files changed**:
- `supabase/functions/crop-advisor/index.ts` (enhanced system prompts)
- `supabase/functions/ai-assistant/index.ts` (enhanced knowledge base)

---

## 7. CropRecommendation.tsx Enhancement

Add soil type selector and visual soil-crop matching directly in the existing Crop Recommendation page:

- Add a **Soil Type** dropdown (Black, Alluvial, Red, Sandy, Laterite, Loam)
- Filter the crop list based on soil compatibility using `suitable_land_types` from the database
- Show fertilizer dose recommendations inline (Urea/DAP/Potash per acre)
- Fetch crops from the database `crops` table instead of hardcoded array

**Files changed**: `src/pages/CropRecommendation.tsx`

---

## Technical Details

### Database Changes
- No schema changes needed -- all tables exist
- Data insertions: ~200+ market price records for TN districts + missing crops
- ~15 additional crops in `crops` table (Barley, Oats, Cowpea, Castor, Safflower, Linseed, Cashew, Tea, Coffee, Watermelon, Muskmelon, Cucumber, Pumpkin, Tapioca, Arecanut)

### Edge Functions Modified
1. `crop-advisor/index.ts` - Enhanced prompts with ICAR data, image analysis, soil-crop mapping
2. `ai-assistant/index.ts` - Enhanced knowledge base with complete agricultural data
3. New: `fetch-weather/index.ts` - OpenWeatherMap integration

### Frontend Pages Modified
1. `MarketPrices.tsx` - Price comparison view with charts
2. `CropRecommendation.tsx` - Soil type filter, DB-driven crops, fertilizer doses
3. `PestDetection.tsx` - Image analysis, expanded crop list
4. `Weather.tsx` - Live weather data
5. `Dashboard.tsx` - Live weather widget, new feature card for soil guide
6. New: `SoilCropGuide.tsx` - Dedicated soil-based recommendation page
7. `App.tsx` - New route for soil guide

### API Integrations
1. **Agmarknet** (already integrated) - Daily cron for market prices
2. **OpenWeatherMap** - New integration for live weather (requires API key secret)
3. **Lovable AI (Gemini)** - Enhanced prompts for crop advisory, pest detection with vision

### Implementation Order
1. Seed more market data for Thiruvallur and TN districts (database inserts)
2. Add more crops to the crops table
3. Build price comparison UI in MarketPrices.tsx
4. Enhance CropRecommendation.tsx with soil filters and DB crops
5. Create SoilCropGuide.tsx page
6. Upgrade crop-advisor edge function with ICAR knowledge + image analysis
7. Set up OpenWeatherMap API and fetch-weather edge function
8. Update Weather.tsx and Dashboard.tsx with live weather
9. Expand PestDetection.tsx crop list and image sending

