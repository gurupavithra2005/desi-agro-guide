

## Fix: Fertilizer Advice Results Not Displaying

### Root Cause

There is a **field name mismatch** between the AI prompt and the UI rendering:

- The **prompt** tells the AI to return: `type`, `quantity_kg_per_ha`, `application_method`, `timing_days_after_sowing`, `cost_estimate`
- The **UI** reads: `name`, `quantity`, `timing`, `method`, `cost`

This is why the cards appear but are blank — the data exists under different field names.

Additionally, the schedule fields in the prompt don't match what the UI expects (`stage`/`timing` + `description`/`fertilizer`).

### Plan

**1. Fix the edge function prompt** (`supabase/functions/crop-advisor/index.ts`)
- Update the fertilizer_advice system prompt to explicitly tell the AI to use these exact JSON field names:
  - `fertilizers` array: `name`, `quantity`, `timing`, `method`, `cost`
  - `schedule` array: `stage`, `description`, `days`
- Add a concrete JSON example in the prompt so the AI follows the exact schema

**2. Add client-side field mapping fallback** (`src/pages/FertilizerAdvice.tsx`)
- After receiving AI response, normalize field names before setting state
- Map `type` → `name`, `quantity_kg_per_ha` → `quantity`, `application_method` → `method`, `timing_days_after_sowing` → `timing`, `cost_estimate` → `cost`
- This handles cases where the AI doesn't follow field name instructions exactly

These two changes together will ensure results display correctly regardless of which field names the AI uses.

