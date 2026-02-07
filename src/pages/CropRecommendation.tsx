import { useState } from 'react';
import { Leaf, Droplets, Mountain, Thermometer, Sun, ChevronRight, Filter } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

interface Crop {
  id: string;
  name: string;
  nameHi: string;
  scientificName: string;
  category: string;
  season: string[];
  waterRequirement: 'low' | 'medium' | 'high';
  growthDays: number;
  suitableFor: string[];
  expectedYield: string;
  profitPotential: 'low' | 'medium' | 'high';
  icon: string;
}

export default function CropRecommendation() {
  const { t } = useLanguage();
  const [selectedSeason, setSelectedSeason] = useState('kharif');
  const [selectedLandType, setSelectedLandType] = useState('all');

  // Mock crop data (will be AI-powered)
  const crops: Crop[] = [
    {
      id: '1',
      name: 'Rice (Paddy)',
      nameHi: 'धान',
      scientificName: 'Oryza sativa',
      category: 'Cereal',
      season: ['kharif'],
      waterRequirement: 'high',
      growthDays: 120,
      suitableFor: ['wet'],
      expectedYield: '40-50 quintals/hectare',
      profitPotential: 'medium',
      icon: '🌾',
    },
    {
      id: '2',
      name: 'Groundnut',
      nameHi: 'मूंगफली',
      scientificName: 'Arachis hypogaea',
      category: 'Oilseed',
      season: ['kharif', 'rabi'],
      waterRequirement: 'medium',
      growthDays: 100,
      suitableFor: ['dry', 'garden'],
      expectedYield: '15-25 quintals/hectare',
      profitPotential: 'high',
      icon: '🥜',
    },
    {
      id: '3',
      name: 'Cotton',
      nameHi: 'कपास',
      scientificName: 'Gossypium',
      category: 'Fiber',
      season: ['kharif'],
      waterRequirement: 'medium',
      growthDays: 150,
      suitableFor: ['dry', 'garden'],
      expectedYield: '20-30 quintals/hectare',
      profitPotential: 'high',
      icon: '☁️',
    },
    {
      id: '4',
      name: 'Wheat',
      nameHi: 'गेहूं',
      scientificName: 'Triticum aestivum',
      category: 'Cereal',
      season: ['rabi'],
      waterRequirement: 'medium',
      growthDays: 120,
      suitableFor: ['dry', 'wet', 'garden'],
      expectedYield: '35-45 quintals/hectare',
      profitPotential: 'medium',
      icon: '🌾',
    },
    {
      id: '5',
      name: 'Tomato',
      nameHi: 'टमाटर',
      scientificName: 'Solanum lycopersicum',
      category: 'Vegetable',
      season: ['kharif', 'rabi'],
      waterRequirement: 'medium',
      growthDays: 90,
      suitableFor: ['garden'],
      expectedYield: '200-400 quintals/hectare',
      profitPotential: 'high',
      icon: '🍅',
    },
    {
      id: '6',
      name: 'Sugarcane',
      nameHi: 'गन्ना',
      scientificName: 'Saccharum officinarum',
      category: 'Cash Crop',
      season: ['kharif'],
      waterRequirement: 'high',
      growthDays: 300,
      suitableFor: ['wet', 'garden'],
      expectedYield: '600-800 quintals/hectare',
      profitPotential: 'medium',
      icon: '🎋',
    },
  ];

  const seasons = [
    { value: 'kharif', label: 'Kharif (Monsoon)', labelHi: 'खरीफ' },
    { value: 'rabi', label: 'Rabi (Winter)', labelHi: 'रबी' },
    { value: 'zaid', label: 'Zaid (Summer)', labelHi: 'जायद' },
  ];

  const landTypes = [
    { value: 'all', label: 'All Land Types' },
    { value: 'dry', label: 'Dry Land' },
    { value: 'wet', label: 'Wet Land' },
    { value: 'garden', label: 'Garden Land' },
  ];

  const filteredCrops = crops.filter((crop) => {
    const matchesSeason = crop.season.includes(selectedSeason);
    const matchesLand = selectedLandType === 'all' || crop.suitableFor.includes(selectedLandType);
    return matchesSeason && matchesLand;
  });

  const getWaterBadgeColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'medium':
        return 'bg-info/20 text-info border-info/30';
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return '';
    }
  };

  const getProfitBadgeColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-muted text-muted-foreground';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'high':
        return 'bg-success/20 text-success';
      default:
        return '';
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('cropRecommendation')} />

      {/* Season Selector */}
      <PageSection>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {seasons.map((season) => (
            <button
              key={season.value}
              onClick={() => setSelectedSeason(season.value)}
              className={`px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-1 min-w-[100px] ${
                selectedSeason === season.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              <p className="font-semibold">{season.labelHi}</p>
              <p className="text-xs opacity-80">{season.label.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </PageSection>

      {/* Land Type Filter */}
      <PageSection>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2 overflow-x-auto">
            {landTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedLandType(type.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedLandType === type.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </PageSection>

      {/* Recommended Crops */}
      <PageSection title={`Recommended Crops (${filteredCrops.length})`}>
        <div className="space-y-3">
          {filteredCrops.map((crop) => (
            <Card key={crop.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-3xl shrink-0">
                    {crop.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg truncate">{crop.name}</h3>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground">{crop.nameHi} • {crop.scientificName}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className={getWaterBadgeColor(crop.waterRequirement)}>
                        <Droplets className="w-3 h-3 mr-1" />
                        {crop.waterRequirement} water
                      </Badge>
                      <Badge variant="outline" className={getProfitBadgeColor(crop.profitPotential)}>
                        💰 {crop.profitPotential} profit
                      </Badge>
                      <Badge variant="outline">
                        📅 {crop.growthDays} days
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Expected: {crop.expectedYield}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      {filteredCrops.length === 0 && (
        <PageSection>
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No crops found for selected filters</p>
              <Button
                variant="link"
                onClick={() => setSelectedLandType('all')}
                className="mt-2"
              >
                Clear filters
              </Button>
            </CardContent>
          </Card>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
