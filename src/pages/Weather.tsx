import { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, Sunrise, Sunset, Loader2, MapPin, AlertTriangle } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const TN_DISTRICTS = [
  "Thiruvallur", "Chennai", "Coimbatore", "Madurai", "Salem",
  "Thanjavur", "Tirunelveli", "Erode", "Tiruchirappalli", "Kanchipuram",
  "Vellore", "Dindigul", "Krishnagiri", "Cuddalore", "Nagapattinam",
  "Kanyakumari", "Nilgiris", "Dharmapuri",
];

interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    sunrise: string;
    sunset: string;
    location: string;
  };
  forecast: {
    day: string;
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
    rainChance: number;
  }[];
  insights: { condition: string; tip: string }[];
}

export default function Weather() {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [district, setDistrict] = useState(profile?.district || 'Thiruvallur');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, [district]);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke('fetch-weather', {
        body: { district },
      });

      if (fnError) throw fnError;
      if (data?.success) {
        setWeather(data.data);
      } else {
        throw new Error(data?.error || 'Failed to fetch weather');
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.message || 'Failed to load weather data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('weather')} />

      {/* District Selector */}
      <PageSection>
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <Label className="text-xs mb-1 block">District</Label>
            <Select value={district} onValueChange={setDistrict}>
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {TN_DISTRICTS.map((d) => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </PageSection>

      {isLoading ? (
        <PageSection>
          <Skeleton className="h-48 w-full rounded-xl" />
          <div className="flex gap-3 mt-4">
            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-32 w-24 rounded-xl" />)}
          </div>
        </PageSection>
      ) : error ? (
        <PageSection>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
              <p className="text-destructive font-medium">{error}</p>
              <Button onClick={fetchWeather} variant="outline" className="mt-3">Retry</Button>
            </CardContent>
          </Card>
        </PageSection>
      ) : weather ? (
        <>
          {/* Current Weather */}
          <PageSection>
            <Card className="bg-gradient-to-br from-info to-info/70 text-info-foreground overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-80">{weather.current.location} — Live</p>
                    <p className="text-6xl font-bold mt-2">{weather.current.temp}°</p>
                    <p className="text-lg mt-1 capitalize">{weather.current.description}</p>
                    <p className="text-sm opacity-80 mt-1">Feels like {weather.current.feelsLike}°C</p>
                  </div>
                  <div className="text-8xl">
                    <CloudSun className="w-24 h-24" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-6">
                  <div className="text-center">
                    <Droplets className="w-6 h-6 mx-auto mb-1 opacity-80" />
                    <p className="text-xs opacity-80">Humidity</p>
                    <p className="font-semibold">{weather.current.humidity}%</p>
                  </div>
                  <div className="text-center">
                    <Wind className="w-6 h-6 mx-auto mb-1 opacity-80" />
                    <p className="text-xs opacity-80">Wind</p>
                    <p className="font-semibold">{weather.current.windSpeed} km/h</p>
                  </div>
                  <div className="text-center">
                    <Sunrise className="w-6 h-6 mx-auto mb-1 opacity-80" />
                    <p className="text-xs opacity-80">Sunrise</p>
                    <p className="font-semibold text-sm">{weather.current.sunrise}</p>
                  </div>
                  <div className="text-center">
                    <Sunset className="w-6 h-6 mx-auto mb-1 opacity-80" />
                    <p className="text-xs opacity-80">Sunset</p>
                    <p className="font-semibold text-sm">{weather.current.sunset}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </PageSection>

          {/* 5-Day Forecast */}
          <PageSection title="5-Day Forecast">
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {weather.forecast.map((day, index) => (
                <Card key={day.date} className={`shrink-0 w-[100px] ${index === 0 ? 'border-primary' : ''}`}>
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

          {/* Farming Insights */}
          <PageSection title="Farming Insights">
            <div className="space-y-3">
              {weather.insights.map((tip, index) => (
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
        </>
      ) : null}

      <BottomNav />
    </PageContainer>
  );
}
