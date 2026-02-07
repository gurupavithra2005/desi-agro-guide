import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';

export default function Landing() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [showLanguageSelect, setShowLanguageSelect] = useState(true);

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center animate-pulse">
            <Leaf className="w-10 h-10 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (showLanguageSelect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-3xl mb-6">
            <Leaf className="w-14 h-14 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">{t('appName')}</h1>
          <p className="text-muted-foreground text-lg">
            Smart Farming Advisory System
          </p>
        </div>

        <div className="w-full max-w-md bg-card rounded-2xl border-2 border-border p-6 animate-slide-up">
          <h2 className="text-xl font-semibold text-center mb-6">{t('selectLanguage')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                }}
                className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                  language === lang.code
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-secondary'
                }`}
              >
                <p className="font-semibold text-lg">{lang.nativeName}</p>
                <p className="text-sm text-muted-foreground">{lang.name}</p>
              </button>
            ))}
          </div>
          <Button
            onClick={() => setShowLanguageSelect(false)}
            className="w-full h-14 text-lg mt-6 gap-2"
          >
            {t('continue')}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-primary rounded-3xl mb-6 shadow-xl">
            <Leaf className="w-16 h-16 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">{t('appName')}</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-sm">
            AI-powered farming advice in your language
          </p>

          {/* Features Preview */}
          <div className="grid grid-cols-3 gap-4 mb-10 max-w-sm mx-auto">
            {[
              { emoji: '🌾', label: 'Crop Advice' },
              { emoji: '🌤️', label: 'Weather' },
              { emoji: '📈', label: 'Prices' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col items-center p-3 bg-card rounded-xl border border-border"
              >
                <span className="text-3xl mb-2">{feature.emoji}</span>
                <span className="text-xs font-medium text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>

          <Button
            onClick={() => navigate('/auth')}
            size="lg"
            className="w-full max-w-sm h-14 text-lg gap-2"
          >
            {t('getStarted')}
            <ArrowRight className="w-5 h-5" />
          </Button>

          <p className="text-sm text-muted-foreground mt-4">
            Free for all farmers
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>Made for Indian Farmers 🇮🇳</p>
      </footer>
    </div>
  );
}
