import { useState } from 'react';
import { Droplets, Leaf, FlaskConical, Calendar, Calculator, Loader2, ChevronRight, AlertCircle, Languages } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FertilizerRecommendation {
  name: string;
  quantity: string;
  timing: string;
  method: string;
  cost?: string;
}

// Multilingual UI translations for Fertilizer Advice page
const fertTranslations: Record<string, Record<string, string>> = {
  en: {
    stcrTitle: 'STCR-Based Recommendations',
    stcrDesc: 'Get personalized fertilizer advice based on your soil test results and target yield using Soil Test Crop Response methodology.',
    farmDetails: 'Farm Details',
    crop: 'Crop',
    selectCrop: 'Select crop',
    landSize: 'Land Size (acres)',
    growthStage: 'Growth Stage',
    soilTestTitle: 'Soil Test Results (Optional)',
    soilPh: 'Soil pH',
    organicCarbon: 'Organic Carbon (%)',
    nitrogen: 'N (kg/ha)',
    phosphorus: 'P (kg/ha)',
    potassium: 'K (kg/ha)',
    soilTip: "Don't have soil test results? Get free testing through the Soil Health Card scheme.",
    analyzing: 'Analyzing...',
    getAdvice: 'Get Fertilizer Advice',
    resultsTitle: 'Recommended Fertilizers',
    method: 'Method',
    estCost: 'Est. Cost',
    scheduleTitle: 'Application Schedule',
    error: 'Error',
    errorDesc: 'Please select a crop',
    success: 'Success',
    successDesc: 'Fertilizer recommendations generated!',
    basal: 'Basal (Before Sowing)',
    vegetative: 'Vegetative Stage',
    flowering: 'Flowering Stage',
    fruiting: 'Fruiting Stage',
    irrigation: 'Irrigation',
    rainfed: 'Rainfed',
    irrigated: 'Irrigated',
    targetYield: 'Target Yield',
    moderate: 'Moderate',
    high: 'High',
    das: 'DAS',
    translateBtn: 'Translate Results',
    translating: 'Translating...',
  },
  hi: {
    stcrTitle: 'STCR-आधारित सिफारिशें',
    stcrDesc: 'मिट्टी परीक्षण फसल प्रतिक्रिया पद्धति का उपयोग करके अपनी मिट्टी परीक्षण परिणामों और लक्ष्य उपज के आधार पर व्यक्तिगत उर्वरक सलाह प्राप्त करें।',
    farmDetails: 'खेत विवरण',
    crop: 'फसल',
    selectCrop: 'फसल चुनें',
    landSize: 'भूमि आकार (एकड़)',
    growthStage: 'विकास चरण',
    soilTestTitle: 'मिट्टी परीक्षण परिणाम (वैकल्पिक)',
    soilPh: 'मिट्टी pH',
    organicCarbon: 'जैविक कार्बन (%)',
    nitrogen: 'N (kg/ha)',
    phosphorus: 'P (kg/ha)',
    potassium: 'K (kg/ha)',
    soilTip: 'मिट्टी परीक्षण परिणाम नहीं हैं? मृदा स्वास्थ्य कार्ड योजना से मुफ्त परीक्षण कराएं।',
    analyzing: 'विश्लेषण हो रहा है...',
    getAdvice: 'उर्वरक सलाह प्राप्त करें',
    resultsTitle: 'अनुशंसित उर्वरक',
    method: 'विधि',
    estCost: 'अनुमानित लागत',
    scheduleTitle: 'प्रयोग अनुसूची',
    error: 'त्रुटि',
    errorDesc: 'कृपया फसल चुनें',
    success: 'सफलता',
    successDesc: 'उर्वरक सिफारिशें तैयार!',
    basal: 'बेसल (बुवाई से पहले)',
    vegetative: 'वानस्पतिक अवस्था',
    flowering: 'फूल अवस्था',
    fruiting: 'फल अवस्था',
    irrigation: 'सिंचाई',
    rainfed: 'वर्षा-आधारित',
    irrigated: 'सिंचित',
    targetYield: 'लक्ष्य उपज',
    moderate: 'मध्यम',
    high: 'उच्च',
    das: 'DAS', translateBtn: 'हिंदी में अनुवाद करें', translating: 'अनुवाद हो रहा है...',
  },
  ta: {
    stcrTitle: 'STCR அடிப்படையிலான பரிந்துரைகள்',
    stcrDesc: 'மண் பரிசோதனை பயிர் பதில் முறையைப் பயன்படுத்தி உங்கள் மண் பரிசோதனை முடிவுகள் மற்றும் இலக்கு மகசூல் அடிப்படையில் தனிப்பயனாக்கப்பட்ட உர ஆலோசனையைப் பெறுங்கள்.',
    farmDetails: 'பண்ணை விவரங்கள்',
    crop: 'பயிர்',
    selectCrop: 'பயிரை தேர்வு செய்யவும்',
    landSize: 'நில அளவு (ஏக்கர்)',
    growthStage: 'வளர்ச்சி நிலை',
    soilTestTitle: 'மண் பரிசோதனை முடிவுகள் (விருப்பமானது)',
    soilPh: 'மண் pH',
    organicCarbon: 'கரிம கார்பன் (%)',
    nitrogen: 'N (kg/ha)',
    phosphorus: 'P (kg/ha)',
    potassium: 'K (kg/ha)',
    soilTip: 'மண் பரிசோதனை முடிவுகள் இல்லையா? மண் ஆரோக்கிய அட்டை திட்டம் மூலம் இலவச பரிசோதனை பெறுங்கள்.',
    analyzing: 'பகுப்பாய்வு செய்கிறது...',
    getAdvice: 'உர ஆலோசனை பெறுங்கள்',
    resultsTitle: 'பரிந்துரைக்கப்பட்ட உரங்கள்',
    method: 'முறை',
    estCost: 'மதிப்பிடப்பட்ட செலவு',
    scheduleTitle: 'பயன்பாட்டு அட்டவணை',
    error: 'பிழை',
    errorDesc: 'பயிரை தேர்வு செய்யவும்',
    success: 'வெற்றி',
    successDesc: 'உர பரிந்துரைகள் உருவாக்கப்பட்டன!',
    basal: 'அடிப்படை (விதைப்பதற்கு முன்)',
    vegetative: 'தாவர நிலை',
    flowering: 'பூக்கும் நிலை',
    fruiting: 'காய்க்கும் நிலை',
    irrigation: 'பாசனம்',
    rainfed: 'மழையை சார்ந்த',
    irrigated: 'பாசன வசதி',
    targetYield: 'இலக்கு மகசூல்',
    moderate: 'நடுத்தர',
    high: 'அதிக',
    das: 'DAS', translateBtn: 'தமிழில் மொழிபெயர்க்கவும்', translating: 'மொழிபெயர்க்கிறது...',
  },
  te: {
    stcrTitle: 'STCR ఆధారిత సిఫార్సులు', stcrDesc: 'మట్టి పరీక్ష ఫలితాల ఆధారంగా వ్యక్తిగత ఎరువుల సలహా పొందండి.',
    farmDetails: 'పొలం వివరాలు', crop: 'పంట', selectCrop: 'పంటను ఎంచుకోండి', landSize: 'భూమి విస్తీర్ణం (ఎకరాలు)', growthStage: 'పెరుగుదల దశ',
    soilTestTitle: 'మట్టి పరీక్ష ఫలితాలు (ఐచ్ఛికం)', soilPh: 'మట్టి pH', organicCarbon: 'సేంద్రీయ కార్బన్ (%)', nitrogen: 'N (kg/ha)', phosphorus: 'P (kg/ha)', potassium: 'K (kg/ha)',
    soilTip: 'మట్టి పరీక్ష ఫలితాలు లేవా? సాయిల్ హెల్త్ కార్డ్ పథకం ద్వారా ఉచిత పరీక్ష పొందండి.',
    analyzing: 'విశ్లేషిస్తోంది...', getAdvice: 'ఎరువుల సలహా పొందండి', resultsTitle: 'సిఫార్సు చేసిన ఎరువులు', method: 'పద్ధతి', estCost: 'అంచనా ఖర్చు', scheduleTitle: 'వాడకం షెడ్యూల్',
    error: 'లోపం', errorDesc: 'పంటను ఎంచుకోండి', success: 'విజయం', successDesc: 'ఎరువుల సిఫార్సులు సిద్ధం!',
    basal: 'బేసల్ (విత్తనానికి ముందు)', vegetative: 'వృక్ష దశ', flowering: 'పుష్పించే దశ', fruiting: 'ఫలాల దశ',
     irrigation: 'నీటి పారుదల', rainfed: 'వర్షాధారం', irrigated: 'నీటి పారుదల', targetYield: 'లక్ష్య దిగుబడి', moderate: 'మధ్యస్తం', high: 'అధికం', das: 'DAS',
    translateBtn: 'తెలుగులో అనువదించండి', translating: 'అనువదిస్తోంది...',
  },
  kn: {
    stcrTitle: 'STCR ಆಧಾರಿತ ಶಿಫಾರಸುಗಳು', stcrDesc: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಫಲಿತಾಂಶಗಳ ಆಧಾರದ ಮೇಲೆ ವೈಯಕ್ತಿಕ ಗೊಬ್ಬರ ಸಲಹೆ ಪಡೆಯಿರಿ.',
    farmDetails: 'ಹೊಲದ ವಿವರಗಳು', crop: 'ಬೆಳೆ', selectCrop: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ', landSize: 'ಭೂಮಿ ಗಾತ್ರ (ಎಕರೆ)', growthStage: 'ಬೆಳವಣಿಗೆ ಹಂತ',
    soilTestTitle: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಫಲಿತಾಂಶ (ಐಚ್ಛಿಕ)', soilPh: 'ಮಣ್ಣಿನ pH', organicCarbon: 'ಸಾವಯವ ಕಾರ್ಬನ್ (%)', nitrogen: 'N (kg/ha)', phosphorus: 'P (kg/ha)', potassium: 'K (kg/ha)',
    soilTip: 'ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ ಇಲ್ಲವೇ? ಸಾಯಿಲ್ ಹೆಲ್ತ್ ಕಾರ್ಡ್ ಮೂಲಕ ಉಚಿತ ಪರೀಕ್ಷೆ ಪಡೆಯಿರಿ.',
    analyzing: 'ವಿಶ್ಲೇಷಣೆ...', getAdvice: 'ಗೊಬ್ಬರ ಸಲಹೆ ಪಡೆಯಿರಿ', resultsTitle: 'ಶಿಫಾರಸು ಮಾಡಿದ ಗೊಬ್ಬರಗಳು', method: 'ವಿಧಾನ', estCost: 'ಅಂದಾಜು ವೆಚ್ಚ', scheduleTitle: 'ಬಳಕೆ ವೇಳಾಪಟ್ಟಿ',
    error: 'ದೋಷ', errorDesc: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ', success: 'ಯಶಸ್ಸು', successDesc: 'ಗೊಬ್ಬರ ಶಿಫಾರಸು ಸಿದ್ಧ!',
    basal: 'ಬೇಸಲ್ (ಬಿತ್ತನೆಗೆ ಮುನ್ನ)', vegetative: 'ಸಸ್ಯ ಹಂತ', flowering: 'ಹೂಬಿಡುವ ಹಂತ', fruiting: 'ಹಣ್ಣಾಗುವ ಹಂತ',
    irrigation: 'ನೀರಾವರಿ', rainfed: 'ಮಳೆ ಆಧಾರಿತ', irrigated: 'ನೀರಾವರಿ', targetYield: 'ಗುರಿ ಇಳುವರಿ', moderate: 'ಮಧ್ಯಮ', high: 'ಹೆಚ್ಚು', das: 'DAS',
  },
  bn: {
    stcrTitle: 'STCR ভিত্তিক সুপারিশ', stcrDesc: 'মাটি পরীক্ষার ফলাফলের ভিত্তিতে ব্যক্তিগত সার পরামর্শ পান।',
    farmDetails: 'জমির বিবরণ', crop: 'ফসল', selectCrop: 'ফসল নির্বাচন করুন', landSize: 'জমির আকার (একর)', growthStage: 'বৃদ্ধির পর্যায়',
    soilTestTitle: 'মাটি পরীক্ষার ফলাফল (ঐচ্ছিক)', soilPh: 'মাটির pH', organicCarbon: 'জৈব কার্বন (%)', nitrogen: 'N (kg/ha)', phosphorus: 'P (kg/ha)', potassium: 'K (kg/ha)',
    soilTip: 'মাটি পরীক্ষার ফলাফল নেই? সয়েল হেলথ কার্ড স্কিম থেকে বিনামূল্যে পরীক্ষা করান।',
    analyzing: 'বিশ্লেষণ...', getAdvice: 'সার পরামর্শ পান', resultsTitle: 'প্রস্তাবিত সার', method: 'পদ্ধতি', estCost: 'আনুমানিক খরচ', scheduleTitle: 'প্রয়োগ সূচি',
    error: 'ত্রুটি', errorDesc: 'ফসল নির্বাচন করুন', success: 'সফল', successDesc: 'সার সুপারিশ তৈরি!',
    basal: 'বেসাল (বপনের আগে)', vegetative: 'উদ্ভিদ পর্যায়', flowering: 'ফুলের পর্যায়', fruiting: 'ফলের পর্যায়',
    irrigation: 'সেচ', rainfed: 'বৃষ্টিনির্ভর', irrigated: 'সেচযুক্ত', targetYield: 'লক্ষ্য ফলন', moderate: 'মাঝারি', high: 'বেশি', das: 'DAS',
  },
  pa: {
    stcrTitle: 'STCR ਅਧਾਰਿਤ ਸਿਫਾਰਸ਼ਾਂ', stcrDesc: 'ਮਿੱਟੀ ਟੈਸਟ ਨਤੀਜਿਆਂ ਦੇ ਆਧਾਰ \'ਤੇ ਖਾਦ ਸਲਾਹ ਪ੍ਰਾਪਤ ਕਰੋ।',
    farmDetails: 'ਖੇਤ ਵੇਰਵੇ', crop: 'ਫ਼ਸਲ', selectCrop: 'ਫ਼ਸਲ ਚੁਣੋ', landSize: 'ਜ਼ਮੀਨ ਦਾ ਆਕਾਰ (ਏਕੜ)', growthStage: 'ਵਿਕਾਸ ਪੜਾਅ',
    soilTestTitle: 'ਮਿੱਟੀ ਟੈਸਟ ਨਤੀਜੇ (ਵਿਕਲਪਿਕ)', soilPh: 'ਮਿੱਟੀ pH', organicCarbon: 'ਜੈਵਿਕ ਕਾਰਬਨ (%)', nitrogen: 'N (kg/ha)', phosphorus: 'P (kg/ha)', potassium: 'K (kg/ha)',
    soilTip: 'ਮਿੱਟੀ ਟੈਸਟ ਨਤੀਜੇ ਨਹੀਂ? ਸਾਇਲ ਹੈਲਥ ਕਾਰਡ ਤੋਂ ਮੁਫ਼ਤ ਟੈਸਟ ਕਰਾਓ।',
    analyzing: 'ਵਿਸ਼ਲੇਸ਼ਣ...', getAdvice: 'ਖਾਦ ਸਲਾਹ ਲਵੋ', resultsTitle: 'ਸਿਫਾਰਸ਼ੀ ਖਾਦਾਂ', method: 'ਤਰੀਕਾ', estCost: 'ਅੰਦਾਜ਼ਨ ਲਾਗਤ', scheduleTitle: 'ਵਰਤੋਂ ਸਮਾਂ-ਸੂਚੀ',
    error: 'ਗਲਤੀ', errorDesc: 'ਫ਼ਸਲ ਚੁਣੋ', success: 'ਸਫਲਤਾ', successDesc: 'ਖਾਦ ਸਿਫਾਰਸ਼ਾਂ ਤਿਆਰ!',
    basal: 'ਬੇਸਲ (ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ)', vegetative: 'ਵਧ ਫੁੱਲ ਪੜਾਅ', flowering: 'ਫੁੱਲ ਪੜਾਅ', fruiting: 'ਫਲ ਪੜਾਅ',
    irrigation: 'ਸਿੰਚਾਈ', rainfed: 'ਬਰਸਾਤੀ', irrigated: 'ਸਿੰਚਿਤ', targetYield: 'ਨਿਸ਼ਾਨਾ ਝਾੜ', moderate: 'ਦਰਮਿਆਨਾ', high: 'ਉੱਚ', das: 'DAS',
  },
  mr: {
    stcrTitle: 'STCR आधारित शिफारसी', stcrDesc: 'माती चाचणी निकालांवर आधारित वैयक्तिक खत सल्ला मिळवा.',
    farmDetails: 'शेत तपशील', crop: 'पीक', selectCrop: 'पीक निवडा', landSize: 'जमिनीचे क्षेत्र (एकर)', growthStage: 'वाढीचा टप्पा',
    soilTestTitle: 'माती चाचणी निकाल (ऐच्छिक)', soilPh: 'माती pH', organicCarbon: 'सेंद्रिय कार्बन (%)', nitrogen: 'N (kg/ha)', phosphorus: 'P (kg/ha)', potassium: 'K (kg/ha)',
    soilTip: 'माती चाचणी निकाल नाहीत? सॉइल हेल्थ कार्ड योजनेतून मोफत चाचणी करा.',
    analyzing: 'विश्लेषण...', getAdvice: 'खत सल्ला मिळवा', resultsTitle: 'शिफारस केलेली खते', method: 'पद्धत', estCost: 'अंदाजित खर्च', scheduleTitle: 'वापर वेळापत्रक',
    error: 'त्रुटी', errorDesc: 'पीक निवडा', success: 'यशस्वी', successDesc: 'खत शिफारसी तयार!',
    basal: 'बेसल (पेरणीपूर्वी)', vegetative: 'वनस्पती अवस्था', flowering: 'फुलोरा अवस्था', fruiting: 'फळ अवस्था',
    irrigation: 'सिंचन', rainfed: 'कोरडवाहू', irrigated: 'सिंचित', targetYield: 'उद्दिष्ट उत्पादन', moderate: 'मध्यम', high: 'जास्त', das: 'DAS',
  },
};

export default function FertilizerAdvice() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<FertilizerRecommendation[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  const ft = fertTranslations[language] || fertTranslations.en;

  const [formData, setFormData] = useState({
    crop: '',
    landSize: '1',
    growthStage: 'basal',
    soilPh: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    organicCarbon: '',
    irrigation: 'rainfed',
    targetYield: 'moderate',
  });

  const crops = [
    { value: 'rice', label: 'Rice (धान) 🌾' },
    { value: 'wheat', label: 'Wheat (गेहूं) 🌾' },
    { value: 'cotton', label: 'Cotton (कपास) ☁️' },
    { value: 'groundnut', label: 'Groundnut (मूंगफली) 🥜' },
    { value: 'tomato', label: 'Tomato (टमाटर) 🍅' },
    { value: 'maize', label: 'Maize (मक्का) 🌽' },
    { value: 'sugarcane', label: 'Sugarcane (गन्ना) 🎋' },
    { value: 'soybean', label: 'Soybean (सोयाबीन) 🫛' },
    { value: 'ragi', label: 'Ragi (रागी) 🌾' },
    { value: 'bajra', label: 'Bajra (बाजरा) 🌾' },
    { value: 'jowar', label: 'Jowar (ज्वार) 🌾' },
    { value: 'mustard', label: 'Mustard (सरसों) 🌼' },
    { value: 'sunflower', label: 'Sunflower (सूरजमुखी) 🌻' },
    { value: 'turmeric', label: 'Turmeric (हल्दी) 🟡' },
    { value: 'chilli', label: 'Chilli (मिर्च) 🌶️' },
    { value: 'onion', label: 'Onion (प्याज) 🧅' },
    { value: 'potato', label: 'Potato (आलू) 🥔' },
    { value: 'brinjal', label: 'Brinjal (बैंगन) 🍆' },
    { value: 'okra', label: 'Okra (भिंडी) 🫒' },
    { value: 'banana', label: 'Banana (केला) 🍌' },
    { value: 'coconut', label: 'Coconut (नारियल) 🥥' },
    { value: 'black_gram', label: 'Black Gram (उड़द) 🫘' },
    { value: 'green_gram', label: 'Green Gram (मूंग) 🫘' },
    { value: 'chickpea', label: 'Chickpea (चना) 🫘' },
    { value: 'pigeon_pea', label: 'Pigeon Pea (अरहर) 🫘' },
    { value: 'lentil', label: 'Lentil (मसूर) 🫘' },
    { value: 'cauliflower', label: 'Cauliflower (फूलगोभी) 🥦' },
    { value: 'cabbage', label: 'Cabbage (पत्तागोभी) 🥬' },
    { value: 'capsicum', label: 'Capsicum (शिमला मिर्च) 🫑' },
    { value: 'cucumber', label: 'Cucumber (खीरा) 🥒' },
    { value: 'pumpkin', label: 'Pumpkin (कद्दू) 🎃' },
    { value: 'watermelon', label: 'Watermelon (तरबूज) 🍉' },
    { value: 'bitter_gourd', label: 'Bitter Gourd (करेला) 🥒' },
    { value: 'mango', label: 'Mango (आम) 🥭' },
    { value: 'guava', label: 'Guava (अमरूद) 🍐' },
    { value: 'pomegranate', label: 'Pomegranate (अनार) 🔴' },
    { value: 'drumstick', label: 'Drumstick (मोरिंगा) 🌿' },
    { value: 'curry_leaves', label: 'Curry Leaves (करी पत्ता) 🌿' },
    { value: 'sesame', label: 'Sesame (तिल) 🌾' },
    { value: 'castor', label: 'Castor (अरंडी) 🌿' },
    { value: 'jute', label: 'Jute (पटसन) 🌿' },
    { value: 'tea', label: 'Tea (चाय) 🍵' },
    { value: 'coffee', label: 'Coffee (कॉफी) ☕' },
    { value: 'arecanut', label: 'Arecanut (सुपारी) 🌴' },
    { value: 'cardamom', label: 'Cardamom (इलायची) 🌿' },
    { value: 'pepper', label: 'Black Pepper (काली मिर्च) 🌿' },
    { value: 'ginger', label: 'Ginger (अदरक) 🫚' },
    { value: 'garlic', label: 'Garlic (लहसुन) 🧄' },
    { value: 'coriander', label: 'Coriander (धनिया) 🌿' },
    { value: 'cumin', label: 'Cumin (जीरा) 🌿' },
    { value: 'fenugreek', label: 'Fenugreek (मेथी) 🌿' },
  ];

  const growthStages = [
    { value: 'basal', label: ft.basal },
    { value: 'vegetative', label: ft.vegetative },
    { value: 'flowering', label: ft.flowering },
    { value: 'fruiting', label: ft.fruiting },
  ];

  const handleSubmit = async () => {
    if (!formData.crop) {
      toast({ variant: 'destructive', title: ft.error, description: ft.errorDesc });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crop-advisor', {
        body: {
          type: 'fertilizer_advice',
          data: formData,
          language,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setRecommendations(data.data.fertilizers || []);
        setSchedule(data.data.schedule || []);
        toast({ title: ft.success, description: ft.successDesc });
      } else {
        throw new Error(data?.error || 'Failed to get recommendations');
      }
    } catch (error: any) {
      console.error('Fertilizer advice error:', error);
      toast({
        variant: 'destructive',
        title: ft.error,
        description: error.message || 'Failed to get fertilizer advice',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('fertilizerAdvice')} />

      {/* Info Card */}
      <PageSection>
        <Card className="bg-info/10 border-info/30">
          <CardContent className="p-4 flex items-start gap-3">
            <FlaskConical className="w-8 h-8 text-info shrink-0 mt-1" />
            <div>
              <p className="font-medium">{ft.stcrTitle}</p>
              <p className="text-sm text-muted-foreground">{ft.stcrDesc}</p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Input Form */}
      <PageSection title={ft.farmDetails}>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>{ft.crop}</Label>
                <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder={ft.selectCrop} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {crops.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>{ft.landSize}</Label>
                  <Input
                    type="number"
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label>{ft.growthStage}</Label>
                  <Select value={formData.growthStage} onValueChange={(v) => setFormData({ ...formData, growthStage: v })}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {growthStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Soil Test Results */}
      <PageSection title={ft.soilTestTitle}>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{ft.soilPh}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 6.5"
                  value={formData.soilPh}
                  onChange={(e) => setFormData({ ...formData, soilPh: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Label>{ft.organicCarbon}</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="e.g., 0.5"
                  value={formData.organicCarbon}
                  onChange={(e) => setFormData({ ...formData, organicCarbon: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>{ft.nitrogen}</Label>
                <Input
                  type="number"
                  placeholder="Nitrogen"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Label>{ft.phosphorus}</Label>
                <Input
                  type="number"
                  placeholder="Phosphorus"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Label>{ft.potassium}</Label>
                <Input
                  type="number"
                  placeholder="Potassium"
                  value={formData.potassium}
                  onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-warning shrink-0" />
              <p className="text-sm text-muted-foreground">{ft.soilTip}</p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Submit Button */}
      <PageSection>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-14 text-lg gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {ft.analyzing}
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              {ft.getAdvice}
            </>
          )}
        </Button>
      </PageSection>

      {/* Results */}
      {recommendations.length > 0 && (
        <PageSection title={ft.resultsTitle}>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <FlaskConical className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{rec.name}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">{rec.quantity}</Badge>
                        <Badge variant="outline">{rec.timing}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {ft.method}: {rec.method}
                      </p>
                      {rec.cost && (
                        <p className="text-sm font-medium text-success mt-1">
                          {ft.estCost}: {rec.cost}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      )}

      {/* Application Schedule */}
      {schedule.length > 0 && (
        <PageSection title={ft.scheduleTitle}>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {schedule.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.stage || item.timing}</p>
                      <p className="text-sm text-muted-foreground">{item.description || item.fertilizer}</p>
                    </div>
                    {item.days && (
                      <Badge variant="outline">{item.days} {ft.das}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
