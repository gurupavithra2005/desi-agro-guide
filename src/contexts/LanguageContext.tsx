import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn' | 'pa' | 'mr';

export const LANGUAGES: { code: AppLanguage; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

// Translation keys for the app
type TranslationKey = 
  | 'welcome'
  | 'appName'
  | 'login'
  | 'signup'
  | 'logout'
  | 'phoneNumber'
  | 'email'
  | 'password'
  | 'enterOtp'
  | 'sendOtp'
  | 'verifyOtp'
  | 'selectLanguage'
  | 'dashboard'
  | 'cropRecommendation'
  | 'weather'
  | 'marketPrices'
  | 'pestDetection'
  | 'fertilizerAdvice'
  | 'myFields'
  | 'soilHealth'
  | 'notifications'
  | 'profile'
  | 'settings'
  | 'community'
  | 'schemes'
  | 'voiceAssistant'
  | 'loading'
  | 'error'
  | 'success'
  | 'retry'
  | 'cancel'
  | 'save'
  | 'next'
  | 'back'
  | 'submit'
  | 'continue'
  | 'getStarted';

const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  en: {
    welcome: 'Welcome',
    appName: 'Crop Wise',
    login: 'Login',
    signup: 'Sign Up',
    logout: 'Logout',
    phoneNumber: 'Phone Number',
    email: 'Email',
    password: 'Password',
    enterOtp: 'Enter OTP',
    sendOtp: 'Send OTP',
    verifyOtp: 'Verify OTP',
    selectLanguage: 'Select Language',
    dashboard: 'Dashboard',
    cropRecommendation: 'Crop Recommendation',
    weather: 'Weather',
    marketPrices: 'Market Prices',
    pestDetection: 'Pest Detection',
    fertilizerAdvice: 'Fertilizer Advice',
    myFields: 'My Fields',
    soilHealth: 'Soil Health',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    community: 'Community',
    schemes: 'Government Schemes',
    voiceAssistant: 'Voice Assistant',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    next: 'Next',
    back: 'Back',
    submit: 'Submit',
    continue: 'Continue',
    getStarted: 'Get Started',
  },
  hi: {
    welcome: 'स्वागत है',
    appName: 'क्रॉप वाइज़',
    login: 'लॉग इन करें',
    signup: 'साइन अप करें',
    logout: 'लॉग आउट',
    phoneNumber: 'फ़ोन नंबर',
    email: 'ईमेल',
    password: 'पासवर्ड',
    enterOtp: 'OTP दर्ज करें',
    sendOtp: 'OTP भेजें',
    verifyOtp: 'OTP सत्यापित करें',
    selectLanguage: 'भाषा चुनें',
    dashboard: 'डैशबोर्ड',
    cropRecommendation: 'फसल सिफारिश',
    weather: 'मौसम',
    marketPrices: 'बाजार भाव',
    pestDetection: 'कीट पहचान',
    fertilizerAdvice: 'उर्वरक सलाह',
    myFields: 'मेरे खेत',
    soilHealth: 'मिट्टी स्वास्थ्य',
    notifications: 'सूचनाएं',
    profile: 'प्रोफ़ाइल',
    settings: 'सेटिंग्स',
    community: 'समुदाय',
    schemes: 'सरकारी योजनाएं',
    voiceAssistant: 'वॉइस असिस्टेंट',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    retry: 'पुनः प्रयास करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    next: 'आगे',
    back: 'पीछे',
    submit: 'जमा करें',
    continue: 'जारी रखें',
    getStarted: 'शुरू करें',
  },
  ta: {
    welcome: 'வரவேற்கிறோம்',
    appName: 'க்ராப் வைஸ்',
    login: 'உள்நுழைக',
    signup: 'பதிவு செய்க',
    logout: 'வெளியேறு',
    phoneNumber: 'தொலைபேசி எண்',
    email: 'மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    enterOtp: 'OTP உள்ளிடவும்',
    sendOtp: 'OTP அனுப்பு',
    verifyOtp: 'OTP சரிபார்க்க',
    selectLanguage: 'மொழி தேர்வு செய்க',
    dashboard: 'டாஷ்போர்டு',
    cropRecommendation: 'பயிர் பரிந்துரை',
    weather: 'வானிலை',
    marketPrices: 'சந்தை விலை',
    pestDetection: 'பூச்சி கண்டறிதல்',
    fertilizerAdvice: 'உர ஆலோசனை',
    myFields: 'எனது வயல்கள்',
    soilHealth: 'மண் ஆரோக்கியம்',
    notifications: 'அறிவிப்புகள்',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    community: 'சமூகம்',
    schemes: 'அரசு திட்டங்கள்',
    voiceAssistant: 'குரல் உதவியாளர்',
    loading: 'ஏற்றுகிறது...',
    error: 'பிழை',
    success: 'வெற்றி',
    retry: 'மீண்டும் முயற்சி',
    cancel: 'ரத்து செய்',
    save: 'சேமி',
    next: 'அடுத்து',
    back: 'பின்',
    submit: 'சமர்ப்பி',
    continue: 'தொடர்க',
    getStarted: 'தொடங்குங்கள்',
  },
  te: {
    welcome: 'స్వాగతం',
    appName: 'క్రాప్ వైజ్',
    login: 'లాగిన్',
    signup: 'సైన్ అప్',
    logout: 'లాగ్ అవుట్',
    phoneNumber: 'ఫోన్ నంబర్',
    email: 'ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    enterOtp: 'OTP నమోదు చేయండి',
    sendOtp: 'OTP పంపు',
    verifyOtp: 'OTP ధృవీకరించు',
    selectLanguage: 'భాష ఎంచుకోండి',
    dashboard: 'డాష్‌బోర్డ్',
    cropRecommendation: 'పంట సిఫార్సు',
    weather: 'వాతావరణం',
    marketPrices: 'మార్కెట్ ధరలు',
    pestDetection: 'తెగుళ్ల గుర్తింపు',
    fertilizerAdvice: 'ఎరువుల సలహా',
    myFields: 'నా పొలాలు',
    soilHealth: 'నేల ఆరోగ్యం',
    notifications: 'నోటిఫికేషన్లు',
    profile: 'ప్రొఫైల్',
    settings: 'సెట్టింగ్స్',
    community: 'సమాజం',
    schemes: 'ప్రభుత్వ పథకాలు',
    voiceAssistant: 'వాయిస్ అసిస్టెంట్',
    loading: 'లోడ్ అవుతోంది...',
    error: 'లోపం',
    success: 'విజయం',
    retry: 'మళ్ళీ ప్రయత్నించు',
    cancel: 'రద్దు',
    save: 'సేవ్',
    next: 'తదుపరి',
    back: 'వెనుక',
    submit: 'సమర్పించు',
    continue: 'కొనసాగించు',
    getStarted: 'ప్రారంభించండి',
  },
  kn: {
    welcome: 'ಸ್ವಾಗತ',
    appName: 'ಕ್ರಾಪ್ ವೈಸ್',
    login: 'ಲಾಗಿನ್',
    signup: 'ಸೈನ್ ಅಪ್',
    logout: 'ಲಾಗ್ ಔಟ್',
    phoneNumber: 'ಫೋನ್ ನಂಬರ್',
    email: 'ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    enterOtp: 'OTP ನಮೂದಿಸಿ',
    sendOtp: 'OTP ಕಳುಹಿಸಿ',
    verifyOtp: 'OTP ಪರಿಶೀಲಿಸಿ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    cropRecommendation: 'ಬೆಳೆ ಶಿಫಾರಸು',
    weather: 'ಹವಾಮಾನ',
    marketPrices: 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು',
    pestDetection: 'ಕೀಟ ಪತ್ತೆ',
    fertilizerAdvice: 'ಗೊಬ್ಬರ ಸಲಹೆ',
    myFields: 'ನನ್ನ ಹೊಲಗಳು',
    soilHealth: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ',
    notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    profile: 'ಪ್ರೊಫೈಲ್',
    settings: 'ಸೆಟ್ಟಿಂಗ್ಸ್',
    community: 'ಸಮುದಾಯ',
    schemes: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು',
    voiceAssistant: 'ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್',
    loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    error: 'ದೋಷ',
    success: 'ಯಶಸ್ಸು',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    save: 'ಉಳಿಸಿ',
    next: 'ಮುಂದೆ',
    back: 'ಹಿಂದೆ',
    submit: 'ಸಲ್ಲಿಸಿ',
    continue: 'ಮುಂದುವರಿಸಿ',
    getStarted: 'ಪ್ರಾರಂಭಿಸಿ',
  },
  bn: {
    welcome: 'স্বাগতম',
    appName: 'ক্রপ ওয়াইজ',
    login: 'লগ ইন',
    signup: 'সাইন আপ',
    logout: 'লগ আউট',
    phoneNumber: 'ফোন নম্বর',
    email: 'ইমেইল',
    password: 'পাসওয়ার্ড',
    enterOtp: 'OTP লিখুন',
    sendOtp: 'OTP পাঠান',
    verifyOtp: 'OTP যাচাই করুন',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    dashboard: 'ড্যাশবোর্ড',
    cropRecommendation: 'ফসল সুপারিশ',
    weather: 'আবহাওয়া',
    marketPrices: 'বাজার দাম',
    pestDetection: 'পোকা সনাক্তকরণ',
    fertilizerAdvice: 'সার পরামর্শ',
    myFields: 'আমার জমি',
    soilHealth: 'মাটির স্বাস্থ্য',
    notifications: 'বিজ্ঞপ্তি',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস',
    community: 'সম্প্রদায়',
    schemes: 'সরকারি প্রকল্প',
    voiceAssistant: 'ভয়েস সহকারী',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    retry: 'আবার চেষ্টা করুন',
    cancel: 'বাতিল',
    save: 'সংরক্ষণ',
    next: 'পরবর্তী',
    back: 'পিছনে',
    submit: 'জমা দিন',
    continue: 'চালিয়ে যান',
    getStarted: 'শুরু করুন',
  },
  pa: {
    welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    appName: 'ਕ੍ਰਾਪ ਵਾਈਜ਼',
    login: 'ਲਾਗਇਨ',
    signup: 'ਸਾਈਨ ਅੱਪ',
    logout: 'ਲਾਗ ਆਊਟ',
    phoneNumber: 'ਫ਼ੋਨ ਨੰਬਰ',
    email: 'ਈਮੇਲ',
    password: 'ਪਾਸਵਰਡ',
    enterOtp: 'OTP ਦਰਜ ਕਰੋ',
    sendOtp: 'OTP ਭੇਜੋ',
    verifyOtp: 'OTP ਤਸਦੀਕ ਕਰੋ',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    dashboard: 'ਡੈਸ਼ਬੋਰਡ',
    cropRecommendation: 'ਫਸਲ ਸਿਫਾਰਸ਼',
    weather: 'ਮੌਸਮ',
    marketPrices: 'ਮੰਡੀ ਭਾਅ',
    pestDetection: 'ਕੀੜੇ ਪਛਾਣ',
    fertilizerAdvice: 'ਖਾਦ ਸਲਾਹ',
    myFields: 'ਮੇਰੇ ਖੇਤ',
    soilHealth: 'ਮਿੱਟੀ ਸਿਹਤ',
    notifications: 'ਸੂਚਨਾਵਾਂ',
    profile: 'ਪ੍ਰੋਫਾਈਲ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    community: 'ਭਾਈਚਾਰਾ',
    schemes: 'ਸਰਕਾਰੀ ਯੋਜਨਾਵਾਂ',
    voiceAssistant: 'ਵੌਇਸ ਸਹਾਇਕ',
    loading: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
    error: 'ਗਲਤੀ',
    success: 'ਸਫਲਤਾ',
    retry: 'ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    cancel: 'ਰੱਦ ਕਰੋ',
    save: 'ਸੇਵ ਕਰੋ',
    next: 'ਅਗਲਾ',
    back: 'ਪਿੱਛੇ',
    submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    continue: 'ਜਾਰੀ ਰੱਖੋ',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
  },
  mr: {
    welcome: 'स्वागत आहे',
    appName: 'क्रॉप वाइज',
    login: 'लॉग इन',
    signup: 'साइन अप',
    logout: 'लॉग आउट',
    phoneNumber: 'फोन नंबर',
    email: 'ईमेल',
    password: 'पासवर्ड',
    enterOtp: 'OTP टाका',
    sendOtp: 'OTP पाठवा',
    verifyOtp: 'OTP सत्यापित करा',
    selectLanguage: 'भाषा निवडा',
    dashboard: 'डॅशबोर्ड',
    cropRecommendation: 'पीक शिफारस',
    weather: 'हवामान',
    marketPrices: 'बाजार भाव',
    pestDetection: 'कीड ओळख',
    fertilizerAdvice: 'खत सल्ला',
    myFields: 'माझी शेते',
    soilHealth: 'मातीचे आरोग्य',
    notifications: 'सूचना',
    profile: 'प्रोफाइल',
    settings: 'सेटिंग्ज',
    community: 'समुदाय',
    schemes: 'सरकारी योजना',
    voiceAssistant: 'व्हॉइस असिस्टंट',
    loading: 'लोड होत आहे...',
    error: 'त्रुटी',
    success: 'यशस्वी',
    retry: 'पुन्हा प्रयत्न करा',
    cancel: 'रद्द करा',
    save: 'सेव्ह करा',
    next: 'पुढे',
    back: 'मागे',
    submit: 'सबमिट करा',
    continue: 'सुरू ठेवा',
    getStarted: 'सुरू करा',
  },
};

interface LanguageContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    const saved = localStorage.getItem('cropwise-language');
    return (saved as AppLanguage) || 'en';
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('cropwise-language', lang);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
