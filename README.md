# 🌱 Smart Crop Advisory System (CropWise)

An AI-powered mobile-first web application that helps **small & marginal farmers** make smarter decisions — from choosing the right crop and fertilizer, to detecting plant diseases, tracking live mandi prices, and planning around the weather. Built with a focus on Indian agriculture, supporting **8 regional languages** for maximum accessibility.

> **Live App:** https://desi-agro-guide.lovable.app

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌾 **Crop Recommendation** | Soil & season-aware crop suggestions powered by a curated agronomy knowledge base (ICAR-aligned) with pH, drainage, and fertility matching |
| 🐛 **Pest & Disease Detection (CNN)** | Upload a leaf photo → a deep-learning CNN (MobileNet V2, PlantVillage-trained) classifies the disease with confidence scores, then a vision LLM delivers an ICAR-aligned diagnosis and treatment plan |
| 📊 **CNN Confidence Visualisation** | Bar-chart display of classification confidence scores for every prediction |
| 🧪 **Fertilizer Advisory** | Crop + soil based fertilizer dosage, application method, timing, and cost estimates |
| 💰 **Live Market Prices (Agmarknet)** | Real-time mandi prices from the Government of India's data.gov.in (Agmarknet) API across **all 38 Tamil Nadu districts** + major mandis nationwide |
| ⚖️ **Price Comparison** | Compare the same crop's price across districts to find the best-selling market |
| 🌦️ **Weather Intelligence** | Current conditions + 5-day forecast with farming insights (OpenWeatherMap) |
| 🗺️ **Soil–Crop Guide** | Interactive guide mapping soil types (black, red, alluvial, laterite, sandy) to suitable crops per Kharif/Rabi/Zaid season |
| 🗂️ **My Fields** | Farmers can register and manage their fields |
| 🎙️ **Voice Assistant** | Hands-free agricultural Q&A using Speech-to-Text / Text-to-Speech |
| 🏛️ **Government Schemes** | Curated list of central & state schemes for farmers |
| 👥 **Community Forum** | Farmer-to-farmer discussion with officer-verified replies |
| 📖 **Multi-language Guide** | Full usage guide translated into all supported languages |
| 🕘 **Detection History** | Past pest/disease analyses saved for later review |

### 🌐 Supported Languages
English • Hindi (हिंदी) • Tamil (தமிழ்) • Telugu (తెలుగు) • Kannada (ಕನ್ನಡ) • Bengali (বাংলা) • Punjabi (ਪੰਜਾਬੀ) • Marathi (मराठी)

AI-generated results (diagnosis, fertilizer advice, advisories) are delivered **fully in the farmer's selected language**, with a one-tap translate button on result pages.

---

## 🧠 AI / Machine Learning

| Model | Purpose |
|---|---|
| **MobileNet V2 (PlantVillage-fine-tuned)** via Hugging Face Inference API | Primary CNN image classification of crop diseases (38 disease classes) |
| **Google Gemini 2.5 Pro (Vision)** | Detailed visual diagnosis: disease identification, severity, symptoms, treatment, and prevention |
| **Google Gemini 3 Flash Preview** | Fast conversational advisory (crop advice, fertilizer guidance, voice assistant) |

A **dual-pipeline architecture** runs the CNN first for speed and measurable confidence scores, then enriches the result with a vision-LLM diagnosis — combining the reliability of trained classifiers with the flexibility of a large language model. A curated in-app **disease knowledge base** (30+ fungal, bacterial, viral diseases and insect pests with exact symptoms and treatments) grounds the model outputs in verified agronomy data.

---

## 🔌 External API Integrations

| API | Provider | Used For |
|---|---|---|
| **Agmarknet Open Data API** | data.gov.in (Govt. of India) | Daily mandi prices, all Tamil Nadu districts + national mandis, auto-refreshed via scheduled cron |
| **OpenWeatherMap API** | OpenWeather | Current weather, 5-day forecast, farming insights |
| **Hugging Face Inference API** | Hugging Face | CNN plant-disease classification (MobileNet V2) |
| **Gemini API (Vision & Text)** | Google AI | Crop advisory, fertilizer advice, pest diagnosis |

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React PWA)                       │
│  React 18 + TypeScript + Vite • Tailwind CSS + shadcn/ui     │
│  TanStack Query • React Router v6 • Recharts                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS (JWT-authenticated)
┌──────────────────────────▼──────────────────────────────────┐
│                  EDGE FUNCTIONS (Serverless)                 │
│  ├─ ai-assistant          → Gemini 3 Flash (chat / voice)    │
│  ├─ crop-advisor          → CNN + Gemini 2.5 Pro Vision      │
│  ├─ fetch-weather         → OpenWeatherMap                   │
│  └─ fetch-market-prices   → Agmarknet (data.gov.in)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                        BACKEND                               │
│  PostgreSQL (Row-Level Security) • Auth (Email + OAuth)      │
│  Storage (crop images) • Daily cron job (price refresh)      │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript 5, Vite 5, Tailwind CSS v3, shadcn/ui, TanStack Query, React Router v6, Recharts, Lucide icons
- **Backend:** PostgreSQL with Row-Level Security, built-in authentication, storage buckets, scheduled cron jobs
- **Edge Functions:** Deno-based serverless functions (AI orchestration + external API proxies)
- **Testing:** Vitest
- **Deployment:** Serverless hosting with automatic builds

---

## 📁 Project Structure

```text
src/
├── components/        # UI components (header, bottom nav, splash screen…)
├── contexts/          # Auth & Language contexts
├── hooks/             # Custom hooks
├── integrations/      # Backend client & generated types
├── pages/             # Feature pages (CropRecommendation, PestDetection,
│                      #   MarketPrices, Weather, FertilizerAdvice, Guide,
│                      #   SoilCropGuide, VoiceAssistant, Community…)
└── assets/            # Disease reference images for ML examples
supabase/
├── functions/         # ai-assistant, crop-advisor, fetch-weather,
│                      #   fetch-market-prices
└── migrations/        # Database schema & RLS policies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18 (recommended: install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Installation

```sh
# 1. Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173` with hot-reloading.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Lint the codebase |
| `npm run test` | Run the test suite |

### Environment

Backend configuration (URL & publishable key) is provided automatically by the hosting platform. API keys for OpenWeatherMap, Hugging Face, and Google AI are stored as **server-side secrets** and are never exposed to the client.

---

## 🔐 Security Highlights

- All database tables protected by **Row-Level Security (RLS)** policies
- Every edge function enforces **JWT authentication**
- No raw internal error messages leaked to clients — generic, safe error responses
- API keys stored exclusively as server-side secrets

---

## 📄 License

This project is developed for academic / research purposes supporting Indian agriculture.
