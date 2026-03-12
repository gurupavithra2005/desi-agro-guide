import { useState, useRef, useMemo, useEffect } from 'react';
import { Camera, Upload, Bug, AlertTriangle, Loader2, Leaf, ShieldCheck, Pill, BarChart3, Info, History, Clock, ChevronDown, ChevronUp, ImageIcon, Brain } from 'lucide-react';
import diseaseRefFungal from '@/assets/disease-ref-fungal.jpg';
import diseaseRefInsects from '@/assets/disease-ref-insects.jpg';
import diseaseRefViral from '@/assets/disease-ref-viral.jpg';
import diseaseRefDeficiency from '@/assets/disease-ref-deficiency.jpg';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CnnScore {
  label: string;
  score: number;
}

interface DetectionResult {
  pest: string;
  confidence: number;
  severity: string;
  description?: string;
  treatment: string[];
  organic_alternatives: string[];
  prevention: string[];
}

interface HistoryItem {
  id: string;
  created_at: string;
  detected_pest: string | null;
  confidence_score: number | null;
  severity: string | null;
  treatment_recommendation: string | null;
  ai_response: any;
  image_url: string | null;
}

// Multi-language translations for Pest Detection page
const pestTranslations: Record<string, Record<string, string>> = {
  en: {
    pageTitle: 'Pest & Disease Detection',
    aiPowered: 'AI-Powered Detection with Vision',
    aiDesc: 'Upload a photo of your crop for AI image analysis, or describe symptoms for instant pest identification with ICAR-recommended treatments.',
    uploadTitle: 'Upload Crop Photo',
    imageReady: '📸 Image ready for AI analysis',
    change: 'Change',
    takePhoto: 'Take Photo',
    uploadImage: 'Upload Image',
    describeTitle: 'Describe Symptoms',
    crop: 'Crop',
    selectCrop: 'Select affected crop',
    symptomsLabel: 'Symptoms Description',
    symptomsOptional: '(optional with photo)',
    symptomsPlaceholder: 'Describe what you observe: yellowing leaves, spots, wilting, holes, etc.',
    affectedPart: 'Affected Part',
    spread: 'Spread',
    localized: 'Localized (few plants)',
    spreading: 'Spreading',
    widespread: 'Widespread',
    analyzingImage: 'Analyzing Image with AI Vision...',
    analyzing: 'Analyzing...',
    analyzePhoto: 'Analyze Photo with AI',
    identifyPest: 'Identify Pest/Disease',
    results: 'Detection Results',
    confidence: 'Confidence',
    cnnTitle: 'CNN Classification Scores',
    cnnDesc: 'Plant Disease Model — Top predictions',
    chemicalTitle: 'Chemical Treatment',
    chemicalDesc: 'ICAR-recommended chemical controls',
    organicTitle: 'Organic Alternatives',
    organicDesc: 'Eco-friendly control methods',
    preventionTitle: 'Prevention Tips',
    preventionDesc: 'Prevent future occurrences',
    fileTooLarge: 'File too large',
    fileTooLargeDesc: 'Please upload an image under 5MB',
    errorTitle: 'Error',
    errorDesc: 'Please select a crop and describe symptoms or upload a photo',
    analysisComplete: 'Analysis Complete',
    imageAnalyzed: 'Image analyzed with AI vision!',
    pestIdentified: 'Pest/disease identified!',
    failedAnalysis: 'Failed to analyze pest/disease',
    leaves: 'Leaves', stem: 'Stem', roots: 'Roots', fruits: 'Fruits', flowers: 'Flowers', wholePlant: 'Whole Plant',
    historyTitle: 'Analysis History',
    noHistory: 'No past analyses yet',
    viewHistory: 'View History',
    hideHistory: 'Hide History',
  },
  hi: {
    pageTitle: 'कीट और रोग पहचान',
    aiPowered: 'AI-संचालित पहचान',
    aiDesc: 'AI छवि विश्लेषण के लिए अपनी फसल की तस्वीर अपलोड करें, या ICAR-अनुशंसित उपचार के साथ तुरंत कीट पहचान के लिए लक्षणों का वर्णन करें।',
    uploadTitle: 'फसल की तस्वीर अपलोड करें',
    imageReady: '📸 छवि AI विश्लेषण के लिए तैयार',
    change: 'बदलें',
    takePhoto: 'फोटो लें',
    uploadImage: 'छवि अपलोड करें',
    describeTitle: 'लक्षण बताएं',
    crop: 'फसल',
    selectCrop: 'प्रभावित फसल चुनें',
    symptomsLabel: 'लक्षणों का विवरण',
    symptomsOptional: '(फोटो के साथ वैकल्पिक)',
    symptomsPlaceholder: 'जो आप देखते हैं उसका वर्णन करें: पत्तियों का पीलापन, धब्बे, मुरझाना, छेद आदि।',
    affectedPart: 'प्रभावित भाग',
    spread: 'फैलाव',
    localized: 'स्थानीय (कुछ पौधे)',
    spreading: 'फैल रहा है',
    widespread: 'व्यापक',
    analyzingImage: 'AI विजन से छवि का विश्लेषण...',
    analyzing: 'विश्लेषण हो रहा है...',
    analyzePhoto: 'AI से फोटो विश्लेषण',
    identifyPest: 'कीट/रोग पहचानें',
    results: 'पहचान परिणाम',
    confidence: 'विश्वास स्तर',
    cnnTitle: 'CNN वर्गीकरण स्कोर',
    cnnDesc: 'पौधा रोग मॉडल — शीर्ष भविष्यवाणियाँ',
    chemicalTitle: 'रासायनिक उपचार',
    chemicalDesc: 'ICAR-अनुशंसित रासायनिक नियंत्रण',
    organicTitle: 'जैविक विकल्प',
    organicDesc: 'पर्यावरण-अनुकूल नियंत्रण विधियाँ',
    preventionTitle: 'रोकथाम के उपाय',
    preventionDesc: 'भविष्य में रोकथाम करें',
    fileTooLarge: 'फ़ाइल बहुत बड़ी',
    fileTooLargeDesc: '5MB से कम छवि अपलोड करें',
    errorTitle: 'त्रुटि',
    errorDesc: 'कृपया फसल चुनें और लक्षण बताएं या फोटो अपलोड करें',
    analysisComplete: 'विश्लेषण पूर्ण',
    imageAnalyzed: 'AI विजन से छवि का विश्लेषण हुआ!',
    pestIdentified: 'कीट/रोग की पहचान हुई!',
    failedAnalysis: 'कीट/रोग विश्लेषण विफल',
    leaves: 'पत्तियाँ', stem: 'तना', roots: 'जड़ें', fruits: 'फल', flowers: 'फूल', wholePlant: 'पूरा पौधा',
    historyTitle: 'विश्लेषण इतिहास',
    noHistory: 'अभी तक कोई विश्लेषण नहीं',
    viewHistory: 'इतिहास देखें',
    hideHistory: 'इतिहास छुपाएं',
  },
  ta: {
    pageTitle: 'பூச்சி மற்றும் நோய் கண்டறிதல்',
    aiPowered: 'AI-இயக்கப்படும் கண்டறிதல்',
    aiDesc: 'AI பட பகுப்பாய்விற்கு உங்கள் பயிரின் புகைப்படத்தை பதிவேற்றவும், அல்லது ICAR-பரிந்துரைக்கப்பட்ட சிகிச்சைகளுடன் உடனடி பூச்சி அடையாளத்திற்கு அறிகுறிகளை விவரிக்கவும்.',
    uploadTitle: 'பயிர் புகைப்படம் பதிவேற்றம்',
    imageReady: '📸 படம் AI பகுப்பாய்விற்கு தயார்',
    change: 'மாற்று',
    takePhoto: 'புகைப்படம் எடு',
    uploadImage: 'படம் பதிவேற்று',
    describeTitle: 'அறிகுறிகளை விவரிக்கவும்',
    crop: 'பயிர்',
    selectCrop: 'பாதிக்கப்பட்ட பயிரை தேர்வு செய்யவும்',
    symptomsLabel: 'அறிகுறிகள் விவரணை',
    symptomsOptional: '(புகைப்படத்துடன் விருப்பமானது)',
    symptomsPlaceholder: 'நீங்கள் கவனிப்பதை விவரிக்கவும்: இலைகள் மஞ்சளாதல், புள்ளிகள், வாடுதல், துளைகள் போன்றவை.',
    affectedPart: 'பாதிக்கப்பட்ட பகுதி',
    spread: 'பரவல்',
    localized: 'உள்ளூர் (சில செடிகள்)',
    spreading: 'பரவுகிறது',
    widespread: 'பரவலானது',
    analyzingImage: 'AI விஷன் மூலம் படம் பகுப்பாய்வு...',
    analyzing: 'பகுப்பாய்வு செய்கிறது...',
    analyzePhoto: 'AI மூலம் புகைப்படம் பகுப்பாய்வு',
    identifyPest: 'பூச்சி/நோய் கண்டறியவும்',
    results: 'கண்டறிதல் முடிவுகள்',
    confidence: 'நம்பிக்கை',
    cnnTitle: 'CNN வகைப்பாடு மதிப்பெண்கள்',
    cnnDesc: 'தாவர நோய் மாதிரி — முதல் கணிப்புகள்',
    chemicalTitle: 'இரசாயன சிகிச்சை',
    chemicalDesc: 'ICAR-பரிந்துரைக்கப்பட்ட இரசாயன கட்டுப்பாடுகள்',
    organicTitle: 'இயற்கை மாற்றுகள்',
    organicDesc: 'சுற்றுச்சூழல் நட்பு கட்டுப்பாட்டு முறைகள்',
    preventionTitle: 'தடுப்பு குறிப்புகள்',
    preventionDesc: 'எதிர்கால நிகழ்வுகளை தடுக்கவும்',
    fileTooLarge: 'கோப்பு மிகப் பெரியது',
    fileTooLargeDesc: '5MB-க்கு குறைவான படத்தை பதிவேற்றவும்',
    errorTitle: 'பிழை',
    errorDesc: 'பயிரை தேர்வு செய்து அறிகுறிகளை விவரிக்கவும் அல்லது புகைப்படம் பதிவேற்றவும்',
    analysisComplete: 'பகுப்பாய்வு முடிந்தது',
    imageAnalyzed: 'AI விஷன் மூலம் படம் பகுப்பாய்வு செய்யப்பட்டது!',
    pestIdentified: 'பூச்சி/நோய் கண்டறியப்பட்டது!',
    failedAnalysis: 'பூச்சி/நோய் பகுப்பாய்வு தோல்வி',
    leaves: 'இலைகள்', stem: 'தண்டு', roots: 'வேர்கள்', fruits: 'பழங்கள்', flowers: 'பூக்கள்', wholePlant: 'முழு செடி',
    historyTitle: 'பகுப்பாய்வு வரலாறு',
    noHistory: 'இதுவரை பகுப்பாய்வு இல்லை',
    viewHistory: 'வரலாறு காண்க',
    hideHistory: 'வரலாறு மறை',
  },
  te: {
    pageTitle: 'తెగుళ్ళు & వ్యాధి గుర్తింపు', aiPowered: 'AI-ఆధారిత గుర్తింపు',
    aiDesc: 'AI చిత్ర విశ్లేషణ కోసం మీ పంట ఫోటోను అప్‌లోడ్ చేయండి.',
    uploadTitle: 'పంట ఫోటో అప్‌లోడ్', imageReady: '📸 చిత్రం AI విశ్లేషణకు సిద్ధం', change: 'మార్చు', takePhoto: 'ఫోటో తీయండి', uploadImage: 'చిత్రం అప్‌లోడ్',
    describeTitle: 'లక్షణాలను వివరించండి', crop: 'పంట', selectCrop: 'ప్రభావిత పంటను ఎంచుకోండి', symptomsLabel: 'లక్షణాల వివరణ', symptomsOptional: '(ఫోటోతో ఐచ్ఛికం)', symptomsPlaceholder: 'మీరు గమనించిన దానిని వివరించండి.',
    affectedPart: 'ప్రభావిత భాగం', spread: 'వ్యాప్తి', localized: 'స్థానికం', spreading: 'వ్యాపిస్తోంది', widespread: 'విస్తృతం',
    analyzingImage: 'AI విజన్‌తో చిత్రం విశ్లేషణ...', analyzing: 'విశ్లేషణ...', analyzePhoto: 'AI తో ఫోటో విశ్లేషణ', identifyPest: 'తెగుళ్ళు/వ్యాధి గుర్తించండి',
    results: 'గుర్తింపు ఫలితాలు', confidence: 'విశ్వాసం', cnnTitle: 'CNN వర్గీకరణ స్కోర్లు', cnnDesc: 'మొక్క వ్యాధి మోడల్', chemicalTitle: 'రసాయన చికిత్స', chemicalDesc: 'ICAR-సిఫార్సు రసాయన నియంత్రణలు', organicTitle: 'సేంద్రీయ ప్రత్యామ్నాయాలు', organicDesc: 'పర్యావరణ అనుకూల నియంత్రణ', preventionTitle: 'నివారణ చిట్కాలు', preventionDesc: 'భవిష్యత్ సంఘటనలను నివారించండి',
    fileTooLarge: 'ఫైల్ చాలా పెద్దది', fileTooLargeDesc: '5MB కంటే తక్కువ చిత్రం అప్‌లోడ్ చేయండి', errorTitle: 'లోపం', errorDesc: 'దయచేసి పంటను ఎంచుకుని లక్షణాలను వివరించండి', analysisComplete: 'విశ్లేషణ పూర్తి', imageAnalyzed: 'AI విజన్‌తో విశ్లేషణ!', pestIdentified: 'తెగుళ్ళు/వ్యాధి గుర్తించబడింది!', failedAnalysis: 'విశ్లేషణ విఫలం',
    leaves: 'ఆకులు', stem: 'కాండం', roots: 'వేర్లు', fruits: 'పండ్లు', flowers: 'పూలు', wholePlant: 'మొత్తం మొక్క',
    historyTitle: 'విశ్లేషణ చరిత్ర', noHistory: 'ఇంకా విశ్లేషణ లేదు', viewHistory: 'చరిత్ర చూడండి', hideHistory: 'చరిత్ర దాచు',
  },
  kn: {
    pageTitle: 'ಕೀಟ & ರೋಗ ಪತ್ತೆ', aiPowered: 'AI-ಚಾಲಿತ ಪತ್ತೆ',
    aiDesc: 'AI ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಗೆ ನಿಮ್ಮ ಬೆಳೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.',
    uploadTitle: 'ಬೆಳೆ ಫೋಟೋ ಅಪ್‌ಲೋಡ್', imageReady: '📸 ಚಿತ್ರ ಸಿದ್ಧ', change: 'ಬದಲಿಸಿ', takePhoto: 'ಫೋಟೋ ತೆಗೆಯಿರಿ', uploadImage: 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್',
    describeTitle: 'ಲಕ್ಷಣಗಳನ್ನು ವಿವರಿಸಿ', crop: 'ಬೆಳೆ', selectCrop: 'ಪ್ರಭಾವಿತ ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ', symptomsLabel: 'ಲಕ್ಷಣಗಳ ವಿವರಣೆ', symptomsOptional: '(ಫೋಟೋ ಇದ್ದರೆ ಐಚ್ಛಿಕ)', symptomsPlaceholder: 'ನೀವು ಗಮನಿಸಿದ್ದನ್ನು ವಿವರಿಸಿ.',
    affectedPart: 'ಪ್ರಭಾವಿತ ಭಾಗ', spread: 'ಹರಡುವಿಕೆ', localized: 'ಸ್ಥಳೀಯ', spreading: 'ಹರಡುತ್ತಿದೆ', widespread: 'ವ್ಯಾಪಕ',
    analyzingImage: 'AI ವಿಷನ್‌ನಿಂದ ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ...', analyzing: 'ವಿಶ್ಲೇಷಣೆ...', analyzePhoto: 'AI ಮೂಲಕ ಫೋಟೋ ವಿಶ್ಲೇಷಣೆ', identifyPest: 'ಕೀಟ/ರೋಗ ಗುರುತಿಸಿ',
    results: 'ಪತ್ತೆ ಫಲಿತಾಂಶಗಳು', confidence: 'ವಿಶ್ವಾಸ', cnnTitle: 'CNN ವರ್ಗೀಕರಣ', cnnDesc: 'ಸಸ್ಯ ರೋಗ ಮಾಡೆಲ್', chemicalTitle: 'ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ', chemicalDesc: 'ICAR-ಶಿಫಾರಸು ನಿಯಂತ್ರಣ', organicTitle: 'ಸಾವಯವ ಪರ್ಯಾಯಗಳು', organicDesc: 'ಪರಿಸರ ಸ್ನೇಹಿ ನಿಯಂತ್ರಣ', preventionTitle: 'ತಡೆಗಟ್ಟುವಿಕೆ ಸಲಹೆಗಳು', preventionDesc: 'ಭವಿಷ್ಯದ ಸಂಭವನೆಗಳನ್ನು ತಡೆಯಿರಿ',
    fileTooLarge: 'ಫೈಲ್ ತುಂಬಾ ದೊಡ್ಡದು', fileTooLargeDesc: '5MB ಒಳಗಿನ ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', errorTitle: 'ದೋಷ', errorDesc: 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ', analysisComplete: 'ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣ', imageAnalyzed: 'AI ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣ!', pestIdentified: 'ಕೀಟ/ರೋಗ ಗುರುತಿಸಲಾಗಿದೆ!', failedAnalysis: 'ವಿಶ್ಲೇಷಣೆ ವಿಫಲ',
    leaves: 'ಎಲೆಗಳು', stem: 'ಕಾಂಡ', roots: 'ಬೇರುಗಳು', fruits: 'ಹಣ್ಣುಗಳು', flowers: 'ಹೂವುಗಳು', wholePlant: 'ಇಡೀ ಸಸ್ಯ',
    historyTitle: 'ವಿಶ್ಲೇಷಣೆ ಇತಿಹಾಸ', noHistory: 'ಇನ್ನೂ ವಿಶ್ಲೇಷಣೆ ಇಲ್ಲ', viewHistory: 'ಇತಿಹಾಸ ನೋಡಿ', hideHistory: 'ಇತಿಹಾಸ ಮರೆಮಾಡಿ',
  },
  bn: {
    pageTitle: 'পোকা ও রোগ সনাক্তকরণ', aiPowered: 'AI-চালিত সনাক্তকরণ',
    aiDesc: 'AI চিত্র বিশ্লেষণের জন্য আপনার ফসলের ছবি আপলোড করুন।',
    uploadTitle: 'ফসলের ছবি আপলোড', imageReady: '📸 ছবি প্রস্তুত', change: 'পরিবর্তন', takePhoto: 'ছবি তুলুন', uploadImage: 'ছবি আপলোড',
    describeTitle: 'লক্ষণ বর্ণনা করুন', crop: 'ফসল', selectCrop: 'প্রভাবিত ফসল নির্বাচন', symptomsLabel: 'লক্ষণের বিবরণ', symptomsOptional: '(ছবির সাথে ঐচ্ছিক)', symptomsPlaceholder: 'আপনি যা দেখেছেন তা বর্ণনা করুন।',
    affectedPart: 'প্রভাবিত অংশ', spread: 'বিস্তার', localized: 'স্থানীয়', spreading: 'ছড়াচ্ছে', widespread: 'ব্যাপক',
    analyzingImage: 'AI দিয়ে ছবি বিশ্লেষণ...', analyzing: 'বিশ্লেষণ...', analyzePhoto: 'AI দিয়ে ছবি বিশ্লেষণ', identifyPest: 'পোকা/রোগ সনাক্ত করুন',
    results: 'সনাক্তকরণ ফলাফল', confidence: 'আত্মবিশ্বাস', cnnTitle: 'CNN শ্রেণীবিভাগ', cnnDesc: 'উদ্ভিদ রোগ মডেল', chemicalTitle: 'রাসায়নিক চিকিৎসা', chemicalDesc: 'ICAR-প্রস্তাবিত নিয়ন্ত্রণ', organicTitle: 'জৈব বিকল্প', organicDesc: 'পরিবেশবান্ধব নিয়ন্ত্রণ', preventionTitle: 'প্রতিরোধ পরামর্শ', preventionDesc: 'ভবিষ্যত সংক্রমণ প্রতিরোধ',
    fileTooLarge: 'ফাইল খুব বড়', fileTooLargeDesc: '5MB-র কম ছবি আপলোড করুন', errorTitle: 'ত্রুটি', errorDesc: 'ফসল নির্বাচন করুন', analysisComplete: 'বিশ্লেষণ সম্পন্ন', imageAnalyzed: 'AI বিশ্লেষণ হয়েছে!', pestIdentified: 'পোকা/রোগ সনাক্ত!', failedAnalysis: 'বিশ্লেষণ ব্যর্থ',
    leaves: 'পাতা', stem: 'কান্ড', roots: 'শিকড়', fruits: 'ফল', flowers: 'ফুল', wholePlant: 'সম্পূর্ণ গাছ',
    historyTitle: 'বিশ্লেষণ ইতিহাস', noHistory: 'এখনো কোনো বিশ্লেষণ নেই', viewHistory: 'ইতিহাস দেখুন', hideHistory: 'ইতিহাস লুকান',
  },
  pa: {
    pageTitle: 'ਕੀੜੇ ਅਤੇ ਬਿਮਾਰੀ ਪਛਾਣ', aiPowered: 'AI-ਸੰਚਾਲਿਤ ਪਛਾਣ',
    aiDesc: 'AI ਚਿੱਤਰ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ ਆਪਣੀ ਫ਼ਸਲ ਦੀ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ।',
    uploadTitle: 'ਫ਼ਸਲ ਫੋਟੋ ਅੱਪਲੋਡ', imageReady: '📸 ਚਿੱਤਰ ਤਿਆਰ', change: 'ਬਦਲੋ', takePhoto: 'ਫੋਟੋ ਖਿੱਚੋ', uploadImage: 'ਚਿੱਤਰ ਅੱਪਲੋਡ',
    describeTitle: 'ਲੱਛਣ ਦੱਸੋ', crop: 'ਫ਼ਸਲ', selectCrop: 'ਪ੍ਰਭਾਵਿਤ ਫ਼ਸਲ ਚੁਣੋ', symptomsLabel: 'ਲੱਛਣਾਂ ਦਾ ਵੇਰਵਾ', symptomsOptional: '(ਫੋਟੋ ਨਾਲ ਵਿਕਲਪਿਕ)', symptomsPlaceholder: 'ਤੁਸੀਂ ਜੋ ਦੇਖਦੇ ਹੋ ਦੱਸੋ।',
    affectedPart: 'ਪ੍ਰਭਾਵਿਤ ਹਿੱਸਾ', spread: 'ਫੈਲਾਅ', localized: 'ਸਥਾਨਕ', spreading: 'ਫੈਲ ਰਿਹਾ', widespread: 'ਵਿਆਪਕ',
    analyzingImage: 'AI ਨਾਲ ਵਿਸ਼ਲੇਸ਼ਣ...', analyzing: 'ਵਿਸ਼ਲੇਸ਼ਣ...', analyzePhoto: 'AI ਨਾਲ ਫੋਟੋ ਵਿਸ਼ਲੇਸ਼ਣ', identifyPest: 'ਕੀੜੇ/ਬਿਮਾਰੀ ਪਛਾਣੋ',
    results: 'ਪਛਾਣ ਨਤੀਜੇ', confidence: 'ਭਰੋਸਾ', cnnTitle: 'CNN ਵਰਗੀਕਰਨ', cnnDesc: 'ਪੌਦਾ ਬਿਮਾਰੀ ਮਾਡਲ', chemicalTitle: 'ਰਸਾਇਣਿਕ ਇਲਾਜ', chemicalDesc: 'ICAR-ਸਿਫਾਰਸ਼ੀ ਨਿਯੰਤਰਣ', organicTitle: 'ਜੈਵਿਕ ਵਿਕਲਪ', organicDesc: 'ਵਾਤਾਵਰਨ-ਅਨੁਕੂਲ ਨਿਯੰਤਰਣ', preventionTitle: 'ਰੋਕਥਾਮ ਸੁਝਾਅ', preventionDesc: 'ਭਵਿੱਖ ਵਿੱਚ ਰੋਕਥਾਮ',
    fileTooLarge: 'ਫ਼ਾਈਲ ਬਹੁਤ ਵੱਡੀ', fileTooLargeDesc: '5MB ਤੋਂ ਘੱਟ', errorTitle: 'ਗਲਤੀ', errorDesc: 'ਫ਼ਸਲ ਚੁਣੋ', analysisComplete: 'ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ', imageAnalyzed: 'AI ਨਾਲ ਵਿਸ਼ਲੇਸ਼ਣ ਹੋਇਆ!', pestIdentified: 'ਪਛਾਣੀ ਗਈ!', failedAnalysis: 'ਵਿਸ਼ਲੇਸ਼ਣ ਅਸਫਲ',
    leaves: 'ਪੱਤੇ', stem: 'ਤਣਾ', roots: 'ਜੜ੍ਹਾਂ', fruits: 'ਫਲ', flowers: 'ਫੁੱਲ', wholePlant: 'ਪੂਰਾ ਪੌਦਾ',
    historyTitle: 'ਵਿਸ਼ਲੇਸ਼ਣ ਇਤਿਹਾਸ', noHistory: 'ਅਜੇ ਕੋਈ ਵਿਸ਼ਲੇਸ਼ਣ ਨਹੀਂ', viewHistory: 'ਇਤਿਹਾਸ ਦੇਖੋ', hideHistory: 'ਇਤਿਹਾਸ ਲੁਕਾਓ',
  },
  mr: {
    pageTitle: 'कीड आणि रोग ओळख', aiPowered: 'AI-चालित ओळख',
    aiDesc: 'AI प्रतिमा विश्लेषणासाठी तुमच्या पिकाचा फोटो अपलोड करा.',
    uploadTitle: 'पिकाचा फोटो अपलोड', imageReady: '📸 प्रतिमा तयार', change: 'बदला', takePhoto: 'फोटो काढा', uploadImage: 'प्रतिमा अपलोड',
    describeTitle: 'लक्षणे वर्णन करा', crop: 'पीक', selectCrop: 'प्रभावित पीक निवडा', symptomsLabel: 'लक्षणांचे वर्णन', symptomsOptional: '(फोटोसह ऐच्छिक)', symptomsPlaceholder: 'तुम्ही काय पाहता ते वर्णन करा.',
    affectedPart: 'प्रभावित भाग', spread: 'प्रसार', localized: 'स्थानिक', spreading: 'पसरत आहे', widespread: 'व्यापक',
    analyzingImage: 'AI ने विश्लेषण...', analyzing: 'विश्लेषण...', analyzePhoto: 'AI ने फोटो विश्लेषण', identifyPest: 'कीड/रोग ओळखा',
    results: 'ओळख निकाल', confidence: 'विश्वास', cnnTitle: 'CNN वर्गीकरण', cnnDesc: 'वनस्पती रोग मॉडेल', chemicalTitle: 'रासायनिक उपचार', chemicalDesc: 'ICAR-शिफारस नियंत्रण', organicTitle: 'सेंद्रिय पर्याय', organicDesc: 'पर्यावरणपूरक नियंत्रण', preventionTitle: 'प्रतिबंध टिपा', preventionDesc: 'भविष्यातील प्रतिबंध',
    fileTooLarge: 'फाइल खूप मोठी', fileTooLargeDesc: '5MB पेक्षा कमी', errorTitle: 'त्रुटी', errorDesc: 'पीक निवडा', analysisComplete: 'विश्लेषण पूर्ण', imageAnalyzed: 'AI ने विश्लेषण झाले!', pestIdentified: 'कीड/रोग ओळखला!', failedAnalysis: 'विश्लेषण अयशस्वी',
    leaves: 'पाने', stem: 'खोड', roots: 'मुळे', fruits: 'फळे', flowers: 'फुले', wholePlant: 'संपूर्ण झाड',
    historyTitle: 'विश्लेषण इतिहास', noHistory: 'अजून कोणतेही विश्लेषण नाही', viewHistory: 'इतिहास पहा', hideHistory: 'इतिहास लपवा',
  },
};

export default function PestDetection() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [cnnScores, setCnnScores] = useState<CnnScore[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const pt = useMemo(() => pestTranslations[language] || pestTranslations.en, [language]);

  const [formData, setFormData] = useState({
    crop: '',
    symptoms: '',
    affectedPart: 'leaves',
    spread: 'localized',
    duration: '1-3 days',
  });

  const crops = [
    { value: 'rice', label: 'Rice (Paddy) 🌾' },
    { value: 'wheat', label: 'Wheat 🌾' },
    { value: 'cotton', label: 'Cotton ☁️' },
    { value: 'maize', label: 'Maize (Corn) 🌽' },
    { value: 'sugarcane', label: 'Sugarcane 🎋' },
    { value: 'groundnut', label: 'Groundnut 🥜' },
    { value: 'soybean', label: 'Soybean 🫛' },
    { value: 'ragi', label: 'Ragi (Finger Millet) 🌾' },
    { value: 'bajra', label: 'Bajra (Pearl Millet) 🌾' },
    { value: 'jowar', label: 'Jowar (Sorghum) 🌾' },
    { value: 'tomato', label: 'Tomato 🍅' },
    { value: 'brinjal', label: 'Brinjal 🍆' },
    { value: 'chilli', label: 'Chilli 🌶️' },
    { value: 'potato', label: 'Potato 🥔' },
    { value: 'onion', label: 'Onion 🧅' },
    { value: 'okra', label: 'Okra (Lady Finger) 🫒' },
    { value: 'cauliflower', label: 'Cauliflower 🥦' },
    { value: 'cabbage', label: 'Cabbage 🥬' },
    { value: 'capsicum', label: 'Capsicum 🫑' },
    { value: 'beans', label: 'Beans 🫘' },
    { value: 'cucumber', label: 'Cucumber 🥒' },
    { value: 'pumpkin', label: 'Pumpkin 🎃' },
    { value: 'bitter_gourd', label: 'Bitter Gourd 🥒' },
    { value: 'watermelon', label: 'Watermelon 🍉' },
    { value: 'banana', label: 'Banana 🍌' },
    { value: 'mango', label: 'Mango 🥭' },
    { value: 'coconut', label: 'Coconut 🥥' },
    { value: 'pomegranate', label: 'Pomegranate 🔴' },
    { value: 'guava', label: 'Guava 🍐' },
    { value: 'turmeric', label: 'Turmeric 🟡' },
    { value: 'drumstick', label: 'Drumstick (Moringa) 🌿' },
    { value: 'curry_leaves', label: 'Curry Leaves 🌿' },
  ];

  const affectedParts = [
    { value: 'leaves', label: pt.leaves },
    { value: 'stem', label: pt.stem },
    { value: 'roots', label: pt.roots },
    { value: 'fruits', label: pt.fruits },
    { value: 'flowers', label: pt.flowers },
    { value: 'whole_plant', label: pt.wholePlant },
  ];

  // Fetch history on mount
  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('pest_detections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (!error && data) {
        setHistory(data as HistoryItem[]);
      }
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const saveToHistory = async (detectionResult: DetectionResult) => {
    if (!user) return;
    try {
      await supabase.from('pest_detections').insert({
        user_id: user.id,
        detected_pest: detectionResult.pest,
        confidence_score: detectionResult.confidence,
        severity: detectionResult.severity,
        treatment_recommendation: Array.isArray(detectionResult.treatment) ? detectionResult.treatment.join('; ') : detectionResult.treatment,
        ai_response: detectionResult as any,
      });
      fetchHistory();
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: pt.fileTooLarge, description: pt.fileTooLargeDesc });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!formData.crop || (!formData.symptoms && !selectedImage)) {
      toast({ variant: 'destructive', title: pt.errorTitle, description: pt.errorDesc });
      return;
    }

    setIsLoading(true);
    try {
      const requestData: any = { ...formData };
      if (selectedImage) {
        requestData.imageBase64 = selectedImage;
      }

      const { data, error } = await supabase.functions.invoke('crop-advisor', {
        body: {
          type: 'pest_detection',
          data: requestData,
          language,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        const detectionResult: DetectionResult = {
          pest: data.data.pest || data.data.identification || 'Unidentified',
          confidence: data.data.confidence || 0.8,
          severity: data.data.severity || 'medium',
          description: data.data.description || '',
          treatment: data.data.treatment || data.data.chemical_control || [],
          organic_alternatives: data.data.organic_alternatives || data.data.biological_control || [],
          prevention: data.data.prevention || data.data.preventive_measures || [],
        };
        setResult(detectionResult);
        setCnnScores(data.cnn_scores || []);
        toast({ title: pt.analysisComplete, description: selectedImage ? pt.imageAnalyzed : pt.pestIdentified });
        
        // Save to history
        saveToHistory(detectionResult);
      } else {
        throw new Error(data?.error || 'Failed to analyze');
      }
    } catch (error: any) {
      console.error('Pest detection error:', error);
      toast({
        variant: 'destructive',
        title: pt.errorTitle,
        description: error.message || pt.failedAnalysis,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    const aiResp = item.ai_response as any;
    if (aiResp) {
      setResult({
        pest: aiResp.pest || item.detected_pest || '',
        confidence: aiResp.confidence || item.confidence_score || 0,
        severity: aiResp.severity || item.severity || 'medium',
        description: aiResp.description || '',
        treatment: aiResp.treatment || [],
        organic_alternatives: aiResp.organic_alternatives || [],
        prevention: aiResp.prevention || [],
      });
    }
    setCnnScores([]);
    setShowHistory(false);
  };

  return (
    <PageContainer>
      <AppHeader title={pt.pageTitle} />

      <PageSection>
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-4 flex items-start gap-3">
            <Bug className="w-8 h-8 text-warning shrink-0 mt-1" />
            <div>
              <p className="font-medium">{pt.aiPowered}</p>
              <p className="text-sm text-muted-foreground">{pt.aiDesc}</p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* History Toggle */}
      {user && (
        <PageSection>
          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full gap-2"
          >
            <History className="w-4 h-4" />
            {showHistory ? pt.hideHistory : pt.viewHistory}
            {showHistory ? <ChevronUp className="w-4 h-4 ml-auto" /> : <ChevronDown className="w-4 h-4 ml-auto" />}
          </Button>

          {showHistory && (
            <div className="mt-3 space-y-2">
              {loadingHistory ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : history.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">{pt.noHistory}</p>
              ) : (
                history.map((item) => (
                  <Card
                    key={item.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => loadHistoryItem(item)}
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.detected_pest || 'N/A'}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString(language === 'en' ? 'en-IN' : `${language}-IN`)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.confidence_score && (
                          <span className="text-xs text-muted-foreground">{Math.round(item.confidence_score * 100)}%</span>
                        )}
                        {item.severity && (
                          <Badge variant="outline" className={`text-xs ${getSeverityColor(item.severity)}`}>
                            {item.severity.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </PageSection>
      )}

      {/* Image Upload */}
      <PageSection title={pt.uploadTitle}>
        <Card>
          <CardContent className="p-4">
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageSelect} className="hidden" />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            
            {selectedImage ? (
              <div className="relative">
                <img src={selectedImage} alt="Selected" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className="bg-success">{pt.imageReady}</Badge>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedImage(null)}>{pt.change}</Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => cameraInputRef.current?.click()} className="flex-1 h-24 flex-col gap-2">
                  <Camera className="w-8 h-8" />
                  <span>{pt.takePhoto}</span>
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1 h-24 flex-col gap-2">
                  <Upload className="w-8 h-8" />
                  <span>{pt.uploadImage}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {/* Symptom Form */}
      <PageSection title={pt.describeTitle}>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>{pt.crop}</Label>
              <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
                <SelectTrigger className="h-12"><SelectValue placeholder={pt.selectCrop} /></SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (<SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{pt.symptomsLabel} {selectedImage ? pt.symptomsOptional : ''}</Label>
              <Textarea
                placeholder={pt.symptomsPlaceholder}
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{pt.affectedPart}</Label>
                <Select value={formData.affectedPart} onValueChange={(v) => setFormData({ ...formData, affectedPart: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {affectedParts.map((part) => (<SelectItem key={part.value} value={part.value}>{part.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{pt.spread}</Label>
                <Select value={formData.spread} onValueChange={(v) => setFormData({ ...formData, spread: v })}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="localized">{pt.localized}</SelectItem>
                    <SelectItem value="spreading">{pt.spreading}</SelectItem>
                    <SelectItem value="widespread">{pt.widespread}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection>
        <Button onClick={handleAnalyze} disabled={isLoading} className="w-full h-14 text-lg gap-2">
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />{selectedImage ? pt.analyzingImage : pt.analyzing}</>
          ) : (
            <><Bug className="w-5 h-5" />{selectedImage ? pt.analyzePhoto : pt.identifyPest}</>
          )}
        </Button>
      </PageSection>

      {/* Results */}
      {result && (
        <>
          <PageSection title={pt.results}>
            <Card className="border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{result.pest}</h3>
                    <p className="text-sm text-muted-foreground">{pt.confidence}: {Math.round(result.confidence * 100)}%</p>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(result.severity)}>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {result.severity.toUpperCase()}
                  </Badge>
                </div>
                {result.description && (
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm">{result.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </PageSection>

          {cnnScores.length > 0 && (
            <PageSection title={pt.cnnTitle}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <BarChart3 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{pt.cnnDesc}</p>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={cnnScores.map(s => ({
                          name: s.label.length > 20 ? s.label.slice(0, 18) + '…' : s.label,
                          fullName: s.label,
                          confidence: Math.round(s.score * 100 * 10) / 10,
                        }))}
                        layout="vertical"
                        margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={130} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: number) => [`${value}%`, pt.confidence]}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
                          contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                        />
                        <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
                          {cnnScores.map((_, index) => (
                            <Cell key={index} fill={index === 0 ? 'hsl(var(--primary))' : index === 1 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))'} fillOpacity={index === 0 ? 1 : 0.6} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </PageSection>
          )}

          {result.treatment && result.treatment.length > 0 && (
            <PageSection title={pt.chemicalTitle}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Pill className="w-5 h-5 text-info shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{pt.chemicalDesc}</p>
                  </div>
                  <ul className="space-y-2">
                    {(Array.isArray(result.treatment) ? result.treatment : [result.treatment]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-secondary/50 rounded-lg">
                        <span className="w-6 h-6 bg-info/20 text-info rounded-full flex items-center justify-center text-sm font-medium shrink-0">{idx + 1}</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </PageSection>
          )}

          {result.organic_alternatives && result.organic_alternatives.length > 0 && (
            <PageSection title={pt.organicTitle}>
              <Card className="bg-success/5 border-success/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Leaf className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{pt.organicDesc}</p>
                  </div>
                  <ul className="space-y-2">
                    {(Array.isArray(result.organic_alternatives) ? result.organic_alternatives : [result.organic_alternatives]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-success/10 rounded-lg">
                        <span className="w-6 h-6 bg-success/20 text-success rounded-full flex items-center justify-center text-sm font-medium shrink-0">{idx + 1}</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </PageSection>
          )}

          {result.prevention && result.prevention.length > 0 && (
            <PageSection title={pt.preventionTitle}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{pt.preventionDesc}</p>
                  </div>
                  <ul className="space-y-2">
                    {(Array.isArray(result.prevention) ? result.prevention : [result.prevention]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </PageSection>
          )}
        </>
      )}

      <BottomNav />
    </PageContainer>
  );
}
