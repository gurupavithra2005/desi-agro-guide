import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  CloudSun,
  TrendingUp,
  Bug,
  Mountain,
  Droplets,
  Map,
  Calendar,
  Users,
  FileText,
  Mic,
  AlertTriangle,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { FeatureCard } from '@/components/ui/feature-card';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const { t } = useLanguage();

  // Mock weather data (will be replaced with real API)
  const weatherData = {
    temp: 28,
    condition: 'Sunny',
    humidity: 65,
    rainChance: 20,
  };

  const features = [
    {
      icon: Leaf,
      title: t('cropRecommendation'),
      description: 'Get AI-powered crop suggestions',
      path: '/crops',
      variant: 'primary' as const,
    },
    {
      icon: Bug,
      title: t('pestDetection'),
      description: 'Identify pests from photos',
      path: '/pests',
      variant: 'warning' as const,
    },
    {
      icon: Droplets,
      title: t('fertilizerAdvice'),
      description: 'Personalized fertilizer plans',
      path: '/fertilizer',
      variant: 'info' as const,
    },
    {
      icon: TrendingUp,
      title: t('marketPrices'),
      description: 'Live mandi prices & trends',
      path: '/market',
      variant: 'success' as const,
    },
    {
      icon: Map,
      title: t('myFields'),
      description: 'Manage your farm plots',
      path: '/fields',
      variant: 'default' as const,
    },
    {
      icon: Mountain,
      title: 'Soil Crop Guide',
      description: 'Soil-based crop & fertilizer advice',
      path: '/soil-guide',
      variant: 'warning' as const,
    },
    {
      icon: Calendar,
      title: 'Crop Calendar',
      description: 'Planting & harvest schedules',
      path: '/calendar',
      variant: 'default' as const,
    },
  ];

  const quickActions = [
    { icon: Mic, title: t('voiceAssistant'), path: '/voice' },
    { icon: Users, title: t('community'), path: '/community' },
    { icon: FileText, title: t('schemes'), path: '/schemes' },
  ];

  return (
    <PageContainer>
      <AppHeader title={t('appName')} notificationCount={3} />

      {/* Weather Card */}
      <PageSection>
        <Card className="bg-gradient-to-br from-info/20 to-info/5 border-info/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-info/20 rounded-2xl flex items-center justify-center">
                  <CloudSun className="w-10 h-10 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('weather')}</p>
                  <p className="text-3xl font-bold text-foreground">{weatherData.temp}°C</p>
                  <p className="text-sm text-muted-foreground">{weatherData.condition}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-info" />
                  <span>{weatherData.humidity}% humidity</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CloudSun className="w-4 h-4 text-warning" />
                  <span>{weatherData.rainChance}% rain</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Alert Banner (if any) */}
      <PageSection>
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-3 flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0" />
            <div>
              <p className="font-medium text-sm">Weather Alert</p>
              <p className="text-xs text-muted-foreground">Heavy rainfall expected in 2 days. Plan irrigation accordingly.</p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Main Features */}
      <PageSection title="Advisory Services">
        <div className="grid grid-cols-1 gap-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.path}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              variant={feature.variant}
              onClick={() => navigate(feature.path)}
            />
          ))}
        </div>
      </PageSection>

      {/* Quick Actions */}
      <PageSection title="Quick Actions">
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-4 bg-card border-2 border-border rounded-xl hover:bg-secondary active:scale-95 transition-all min-h-[100px]"
            >
              <action.icon className="w-8 h-8 text-primary mb-2" />
              <span className="text-xs font-medium text-center">{action.title}</span>
            </button>
          ))}
        </div>
      </PageSection>

      <BottomNav />
    </PageContainer>
  );
}
