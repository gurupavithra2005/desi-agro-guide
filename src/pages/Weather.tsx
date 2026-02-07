import { CloudSun, Droplets, Wind, Thermometer, Eye, Sunrise, Sunset } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Weather() {
  const { t } = useLanguage();

  // Mock weather data (will be replaced with real API)
  const currentWeather = {
    temp: 28,
    feelsLike: 31,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    sunrise: '06:15 AM',
    sunset: '06:45 PM',
  };

  const forecast = [
    { day: 'Today', high: 32, low: 24, condition: 'Sunny', icon: '☀️', rainChance: 10 },
    { day: 'Tomorrow', high: 30, low: 23, condition: 'Cloudy', icon: '⛅', rainChance: 30 },
    { day: 'Wed', high: 28, low: 22, condition: 'Rainy', icon: '🌧️', rainChance: 80 },
    { day: 'Thu', high: 27, low: 21, condition: 'Rainy', icon: '🌧️', rainChance: 70 },
    { day: 'Fri', high: 29, low: 22, condition: 'Partly Cloudy', icon: '⛅', rainChance: 20 },
  ];

  const farmingTips = [
    { condition: 'Good', tip: 'Ideal conditions for spraying pesticides' },
    { condition: 'Warning', tip: 'Expected rain in 2 days - plan harvesting accordingly' },
    { condition: 'Good', tip: 'Good soil moisture for sowing activities' },
  ];

  return (
    <PageContainer>
      <AppHeader title={t('weather')} />

      {/* Current Weather */}
      <PageSection>
        <Card className="bg-gradient-to-br from-info to-info/70 text-info-foreground overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Current Weather</p>
                <p className="text-6xl font-bold mt-2">{currentWeather.temp}°</p>
                <p className="text-lg mt-1">{currentWeather.condition}</p>
                <p className="text-sm opacity-80 mt-1">
                  Feels like {currentWeather.feelsLike}°C
                </p>
              </div>
              <div className="text-8xl">
                <CloudSun className="w-24 h-24" />
              </div>
            </div>

            {/* Weather Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mt-6">
              <div className="text-center">
                <Droplets className="w-6 h-6 mx-auto mb-1 opacity-80" />
                <p className="text-xs opacity-80">Humidity</p>
                <p className="font-semibold">{currentWeather.humidity}%</p>
              </div>
              <div className="text-center">
                <Wind className="w-6 h-6 mx-auto mb-1 opacity-80" />
                <p className="text-xs opacity-80">Wind</p>
                <p className="font-semibold">{currentWeather.windSpeed} km/h</p>
              </div>
              <div className="text-center">
                <Sunrise className="w-6 h-6 mx-auto mb-1 opacity-80" />
                <p className="text-xs opacity-80">Sunrise</p>
                <p className="font-semibold text-sm">{currentWeather.sunrise}</p>
              </div>
              <div className="text-center">
                <Sunset className="w-6 h-6 mx-auto mb-1 opacity-80" />
                <p className="text-xs opacity-80">Sunset</p>
                <p className="font-semibold text-sm">{currentWeather.sunset}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* 5-Day Forecast */}
      <PageSection title="5-Day Forecast">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {forecast.map((day, index) => (
            <Card
              key={day.day}
              className={`shrink-0 w-[100px] ${index === 0 ? 'border-primary' : ''}`}
            >
              <CardContent className="p-3 text-center">
                <p className="text-sm font-medium text-muted-foreground">{day.day}</p>
                <p className="text-4xl my-2">{day.icon}</p>
                <p className="font-bold">{day.high}°</p>
                <p className="text-sm text-muted-foreground">{day.low}°</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-info">
                  <Droplets className="w-3 h-3" />
                  <span>{day.rainChance}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      {/* Farming Tips Based on Weather */}
      <PageSection title="Farming Insights">
        <div className="space-y-3">
          {farmingTips.map((tip, index) => (
            <Card
              key={index}
              className={
                tip.condition === 'Warning'
                  ? 'border-warning/30 bg-warning/5'
                  : 'border-success/30 bg-success/5'
              }
            >
              <CardContent className="p-3 flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    tip.condition === 'Warning' ? 'bg-warning' : 'bg-success'
                  }`}
                />
                <p className="text-sm">{tip.tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      <BottomNav />
    </PageContainer>
  );
}
