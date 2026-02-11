import { useState, useEffect } from 'react';
import { Leaf, Droplets, Mountain, Thermometer, Sun, ChevronRight, Filter, Loader2, Sparkles, MapPin } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Crop {
  id: string;
  name: string;
  nameLocal?: string;
  scientificName?: string;
  category: string;
  season: string[];
  waterRequirement: 'low' | 'medium' | 'high';
  growthDays: number;
  suitableFor: string[];
  expectedYield: string;
  profitPotential: 'low' | 'medium' | 'high';
  icon: string;
  reason?: string;
}

interface AIRecommendation {
  crop_name: string;
  local_name?: string;
  reason: string;
  yield: string;
  profit_potential: string;
  water_requirement: string;
  growth_duration: string;
}

export default function CropRecommendation() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedSeason, setSelectedSeason] = useState('kharif');
  const [selectedLandType, setSelectedLandType] = useState('all');
  const [selectedSoilType, setSelectedSoilType] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [dbCrops, setDbCrops] = useState<any[]>([]);
  
  const [farmDetails, setFarmDetails] = useState({
    state: profile?.state || '',
    district: profile?.district || '',
    landType: profile?.land_type || '',
    landSize: profile?.land_size_acres?.toString() || '',
    soilType: '',
    irrigation: profile?.irrigation_type || 'rainfed',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    soilPh: '',
  });

  // Fetch crops from database
  useEffect(() => {
    const fetchCrops = async () => {
      const { data } = await supabase.from('crops').select('*').order('name_en');
      if (data) setDbCrops(data);
    };
    fetchCrops();
  }, []);

  // Default crop data for basic mode
  const crops: Crop[] = [
    { id: '1', name: 'Rice (Paddy)', nameLocal: 'धान', scientificName: 'Oryza sativa', category: 'Cereal', season: ['kharif'], waterRequirement: 'high', growthDays: 120, suitableFor: ['wet'], expectedYield: '40-50 quintals/hectare', profitPotential: 'medium', icon: '🌾' },
    { id: '2', name: 'Groundnut', nameLocal: 'मूंगफली', scientificName: 'Arachis hypogaea', category: 'Oilseed', season: ['kharif', 'rabi'], waterRequirement: 'medium', growthDays: 100, suitableFor: ['dry', 'garden'], expectedYield: '15-25 quintals/hectare', profitPotential: 'high', icon: '🥜' },
    { id: '3', name: 'Cotton', nameLocal: 'कपास', scientificName: 'Gossypium', category: 'Fiber', season: ['kharif'], waterRequirement: 'medium', growthDays: 150, suitableFor: ['dry', 'garden'], expectedYield: '20-30 quintals/hectare', profitPotential: 'high', icon: '☁️' },
    { id: '4', name: 'Wheat', nameLocal: 'गेहूं', scientificName: 'Triticum aestivum', category: 'Cereal', season: ['rabi'], waterRequirement: 'medium', growthDays: 120, suitableFor: ['dry', 'wet', 'garden'], expectedYield: '35-45 quintals/hectare', profitPotential: 'medium', icon: '🌾' },
    { id: '5', name: 'Tomato', nameLocal: 'टमाटर', scientificName: 'Solanum lycopersicum', category: 'Vegetable', season: ['kharif', 'rabi'], waterRequirement: 'medium', growthDays: 90, suitableFor: ['garden'], expectedYield: '200-400 quintals/hectare', profitPotential: 'high', icon: '🍅' },
    { id: '6', name: 'Sugarcane', nameLocal: 'गन्ना', scientificName: 'Saccharum officinarum', category: 'Cash Crop', season: ['kharif'], waterRequirement: 'high', growthDays: 300, suitableFor: ['wet', 'garden'], expectedYield: '600-800 quintals/hectare', profitPotential: 'medium', icon: '🎋' },
    { id: '7', name: 'Mustard', nameLocal: 'सरसों', scientificName: 'Brassica juncea', category: 'Oilseed', season: ['rabi'], waterRequirement: 'low', growthDays: 110, suitableFor: ['dry'], expectedYield: '12-18 quintals/hectare', profitPotential: 'medium', icon: '🌻' },
    { id: '8', name: 'Gram (Chickpea)', nameLocal: 'चना', scientificName: 'Cicer arietinum', category: 'Pulse', season: ['rabi'], waterRequirement: 'low', growthDays: 95, suitableFor: ['dry'], expectedYield: '15-20 quintals/hectare', profitPotential: 'medium', icon: '🫘' },
    { id: '9', name: 'Bajra (Pearl Millet)', nameLocal: 'बाजरा', scientificName: 'Pennisetum glaucum', category: 'Cereal', season: ['kharif', 'zaid'], waterRequirement: 'low', growthDays: 80, suitableFor: ['dry'], expectedYield: '18-25 quintals/hectare', profitPotential: 'medium', icon: '🌾' },
    { id: '10', name: 'Soybean', nameLocal: 'सोयाबीन', scientificName: 'Glycine max', category: 'Oilseed', season: ['kharif'], waterRequirement: 'medium', growthDays: 100, suitableFor: ['garden', 'wet'], expectedYield: '20-25 quintals/hectare', profitPotential: 'high', icon: '🫛' },
    { id: '11', name: 'Maize (Corn)', nameLocal: 'मक्का', scientificName: 'Zea mays', category: 'Cereal', season: ['kharif', 'rabi'], waterRequirement: 'medium', growthDays: 95, suitableFor: ['dry', 'garden'], expectedYield: '50-70 quintals/hectare', profitPotential: 'medium', icon: '🌽' },
    { id: '12', name: 'Onion', nameLocal: 'प्याज', scientificName: 'Allium cepa', category: 'Vegetable', season: ['kharif', 'rabi'], waterRequirement: 'medium', growthDays: 130, suitableFor: ['garden'], expectedYield: '200-300 quintals/hectare', profitPotential: 'high', icon: '🧅' },
    { id: '13', name: 'Potato', nameLocal: 'आलू', scientificName: 'Solanum tuberosum', category: 'Vegetable', season: ['rabi'], waterRequirement: 'medium', growthDays: 100, suitableFor: ['garden', 'wet'], expectedYield: '200-350 quintals/hectare', profitPotential: 'high', icon: '🥔' },
    { id: '14', name: 'Turmeric', nameLocal: 'हल्दी', scientificName: 'Curcuma longa', category: 'Spice', season: ['kharif'], waterRequirement: 'high', growthDays: 270, suitableFor: ['wet', 'garden'], expectedYield: '50-80 quintals/hectare', profitPotential: 'high', icon: '🟡' },
    { id: '15', name: 'Chilli', nameLocal: 'मिर्च', scientificName: 'Capsicum annuum', category: 'Spice', season: ['kharif', 'rabi'], waterRequirement: 'medium', growthDays: 150, suitableFor: ['garden'], expectedYield: '80-120 quintals/hectare', profitPotential: 'high', icon: '🌶️' },
    { id: '16', name: 'Sunflower', nameLocal: 'सूरजमुखी', scientificName: 'Helianthus annuus', category: 'Oilseed', season: ['kharif', 'rabi', 'zaid'], waterRequirement: 'medium', growthDays: 95, suitableFor: ['dry', 'garden'], expectedYield: '15-20 quintals/hectare', profitPotential: 'medium', icon: '🌻' },
    { id: '17', name: 'Jowar (Sorghum)', nameLocal: 'ज्वार', scientificName: 'Sorghum bicolor', category: 'Cereal', season: ['kharif', 'rabi'], waterRequirement: 'low', growthDays: 100, suitableFor: ['dry'], expectedYield: '20-30 quintals/hectare', profitPotential: 'medium', icon: '🌾' },
    { id: '18', name: 'Ragi (Finger Millet)', nameLocal: 'रागी', scientificName: 'Eleusine coracana', category: 'Cereal', season: ['kharif'], waterRequirement: 'low', growthDays: 110, suitableFor: ['dry'], expectedYield: '15-25 quintals/hectare', profitPotential: 'medium', icon: '🌾' },
    { id: '19', name: 'Moong (Green Gram)', nameLocal: 'मूंग', scientificName: 'Vigna radiata', category: 'Pulse', season: ['kharif', 'zaid'], waterRequirement: 'low', growthDays: 65, suitableFor: ['dry', 'garden'], expectedYield: '8-12 quintals/hectare', profitPotential: 'medium', icon: '🫘' },
    { id: '20', name: 'Urad (Black Gram)', nameLocal: 'उड़द', scientificName: 'Vigna mungo', category: 'Pulse', season: ['kharif'], waterRequirement: 'low', growthDays: 75, suitableFor: ['dry'], expectedYield: '8-12 quintals/hectare', profitPotential: 'medium', icon: '🫘' },
    { id: '21', name: 'Tur (Pigeon Pea)', nameLocal: 'तूर/अरहर', scientificName: 'Cajanus cajan', category: 'Pulse', season: ['kharif'], waterRequirement: 'low', growthDays: 160, suitableFor: ['dry', 'garden'], expectedYield: '12-18 quintals/hectare', profitPotential: 'medium', icon: '🫘' },
    { id: '22', name: 'Lentil (Masoor)', nameLocal: 'मसूर', scientificName: 'Lens culinaris', category: 'Pulse', season: ['rabi'], waterRequirement: 'low', growthDays: 110, suitableFor: ['dry'], expectedYield: '10-15 quintals/hectare', profitPotential: 'medium', icon: '🫘' },
    { id: '23', name: 'Banana', nameLocal: 'केला', scientificName: 'Musa acuminata', category: 'Fruit', season: ['kharif', 'rabi', 'zaid'], waterRequirement: 'high', growthDays: 365, suitableFor: ['wet', 'garden'], expectedYield: '300-500 quintals/hectare', profitPotential: 'high', icon: '🍌' },
    { id: '24', name: 'Mango', nameLocal: 'आम', scientificName: 'Mangifera indica', category: 'Fruit', season: ['zaid'], waterRequirement: 'medium', growthDays: 150, suitableFor: ['garden'], expectedYield: '80-100 quintals/hectare', profitPotential: 'high', icon: '🥭' },
    { id: '25', name: 'Brinjal (Eggplant)', nameLocal: 'बैंगन', scientificName: 'Solanum melongena', category: 'Vegetable', season: ['kharif', 'rabi'], waterRequirement: 'medium', growthDays: 100, suitableFor: ['garden'], expectedYield: '250-400 quintals/hectare', profitPotential: 'medium', icon: '🍆' },
    { id: '26', name: 'Cauliflower', nameLocal: 'फूलगोभी', scientificName: 'Brassica oleracea', category: 'Vegetable', season: ['rabi'], waterRequirement: 'medium', growthDays: 90, suitableFor: ['garden'], expectedYield: '150-250 quintals/hectare', profitPotential: 'medium', icon: '🥦' },
    { id: '27', name: 'Cabbage', nameLocal: 'पत्तागोभी', scientificName: 'Brassica oleracea var.', category: 'Vegetable', season: ['rabi'], waterRequirement: 'medium', growthDays: 90, suitableFor: ['garden'], expectedYield: '200-350 quintals/hectare', profitPotential: 'medium', icon: '🥬' },
    { id: '28', name: 'Jute', nameLocal: 'जूट', scientificName: 'Corchorus', category: 'Fiber', season: ['kharif'], waterRequirement: 'high', growthDays: 120, suitableFor: ['wet'], expectedYield: '20-30 quintals/hectare', profitPotential: 'low', icon: '🌿' },
    { id: '29', name: 'Coconut', nameLocal: 'नारियल', scientificName: 'Cocos nucifera', category: 'Plantation', season: ['kharif', 'rabi', 'zaid'], waterRequirement: 'high', growthDays: 365, suitableFor: ['wet', 'garden'], expectedYield: '10000-15000 nuts/hectare', profitPotential: 'high', icon: '🥥' },
    { id: '30', name: 'Sesame (Til)', nameLocal: 'तिल', scientificName: 'Sesamum indicum', category: 'Oilseed', season: ['kharif'], waterRequirement: 'low', growthDays: 90, suitableFor: ['dry'], expectedYield: '5-8 quintals/hectare', profitPotential: 'medium', icon: '🌱' },
    { id: '31', name: 'Coriander', nameLocal: 'धनिया', scientificName: 'Coriandrum sativum', category: 'Spice', season: ['rabi'], waterRequirement: 'low', growthDays: 90, suitableFor: ['dry', 'garden'], expectedYield: '10-15 quintals/hectare', profitPotential: 'high', icon: '🌿' },
    { id: '32', name: 'Cumin (Jeera)', nameLocal: 'जीरा', scientificName: 'Cuminum cyminum', category: 'Spice', season: ['rabi'], waterRequirement: 'low', growthDays: 120, suitableFor: ['dry'], expectedYield: '5-8 quintals/hectare', profitPotential: 'high', icon: '🌿' },
    { id: '33', name: 'Garlic', nameLocal: 'लहसुन', scientificName: 'Allium sativum', category: 'Spice', season: ['rabi'], waterRequirement: 'medium', growthDays: 140, suitableFor: ['garden'], expectedYield: '60-100 quintals/hectare', profitPotential: 'high', icon: '🧄' },
    { id: '34', name: 'Pea (Matar)', nameLocal: 'मटर', scientificName: 'Pisum sativum', category: 'Vegetable', season: ['rabi'], waterRequirement: 'medium', growthDays: 80, suitableFor: ['garden'], expectedYield: '80-120 quintals/hectare', profitPotential: 'high', icon: '🟢' },
    { id: '35', name: 'Watermelon', nameLocal: 'तरबूज', scientificName: 'Citrullus lanatus', category: 'Fruit', season: ['zaid'], waterRequirement: 'medium', growthDays: 80, suitableFor: ['dry', 'garden'], expectedYield: '300-500 quintals/hectare', profitPotential: 'high', icon: '🍉' },
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

  const soilTypes = [
    { value: '', label: 'All Soils' },
    { value: 'Black', label: 'Black Soil' },
    { value: 'Alluvial', label: 'Alluvial' },
    { value: 'Red', label: 'Red Soil' },
    { value: 'Sandy', label: 'Sandy / Sandy Loam' },
    { value: 'Laterite', label: 'Laterite' },
    { value: 'Loamy', label: 'Loamy' },
  ];

  const filteredCrops = crops.filter((crop) => {
    const matchesSeason = crop.season.includes(selectedSeason);
    const matchesLand = selectedLandType === 'all' || crop.suitableFor.includes(selectedLandType);
    return matchesSeason && matchesLand;
  });

  const getAIRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crop-advisor', {
        body: {
          type: 'crop_recommendation',
          data: {
            ...farmDetails,
            season: selectedSeason,
          },
          language,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.recommendations) {
        setAiRecommendations(data.data.recommendations);
        setIsAIMode(true);
        toast({ title: 'AI Analysis Complete', description: 'Personalized recommendations ready!' });
      } else {
        throw new Error(data?.error || 'Failed to get recommendations');
      }
    } catch (error: any) {
      console.error('AI recommendation error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to get AI recommendations',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWaterBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'medium':
        return 'bg-info/20 text-info border-info/30';
      case 'high':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      default:
        return 'bg-muted';
    }
  };

  const getProfitBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'low':
        return 'bg-muted text-muted-foreground';
      case 'medium':
        return 'bg-warning/20 text-warning';
      case 'high':
        return 'bg-success/20 text-success';
      default:
        return 'bg-muted';
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('cropRecommendation')} />

      {/* AI Mode Toggle */}
      <PageSection>
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold">AI-Powered Recommendations</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Get personalized crop suggestions based on your location, soil data, and climate conditions.
            </p>
            <Button
              onClick={getAIRecommendations}
              disabled={isLoading}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </PageSection>

      {/* Quick Farm Input (for AI) */}
      <PageSection title="Your Farm Details">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">State</Label>
                <Input
                  placeholder="e.g., Maharashtra"
                  value={farmDetails.state}
                  onChange={(e) => setFarmDetails({ ...farmDetails, state: e.target.value })}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-xs">Irrigation</Label>
                <Select 
                  value={farmDetails.irrigation} 
                  onValueChange={(v) => setFarmDetails({ ...farmDetails, irrigation: v })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainfed">Rainfed</SelectItem>
                    <SelectItem value="canal">Canal</SelectItem>
                    <SelectItem value="borewell">Borewell</SelectItem>
                    <SelectItem value="drip">Drip</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">N (kg/ha)</Label>
                <Input
                  type="number"
                  placeholder="N"
                  value={farmDetails.nitrogen}
                  onChange={(e) => setFarmDetails({ ...farmDetails, nitrogen: e.target.value })}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-xs">P (kg/ha)</Label>
                <Input
                  type="number"
                  placeholder="P"
                  value={farmDetails.phosphorus}
                  onChange={(e) => setFarmDetails({ ...farmDetails, phosphorus: e.target.value })}
                  className="h-10"
                />
              </div>
              <div>
                <Label className="text-xs">K (kg/ha)</Label>
                <Input
                  type="number"
                  placeholder="K"
                  value={farmDetails.potassium}
                  onChange={(e) => setFarmDetails({ ...farmDetails, potassium: e.target.value })}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Season Selector */}
      <PageSection>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {seasons.map((season) => (
            <button
              key={season.value}
              onClick={() => {
                setSelectedSeason(season.value);
                setIsAIMode(false);
              }}
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
                onClick={() => {
                  setSelectedLandType(type.value);
                  setIsAIMode(false);
                }}
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

      {/* Soil Type Filter */}
      <PageSection>
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-2 overflow-x-auto">
            {soilTypes.map((soil) => (
              <button
                key={soil.value}
                onClick={() => {
                  setSelectedSoilType(soil.value);
                  setIsAIMode(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSoilType === soil.value
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {soil.label}
              </button>
            ))}
          </div>
        </div>
      </PageSection>

      {/* DB Crops Section */}
      {dbCrops.length > 0 && !isAIMode && (
        <PageSection title={`From Database (${dbCrops.filter(c => {
          const matchesSeason = c.season?.includes(selectedSeason === 'kharif' ? 'Kharif' : selectedSeason === 'rabi' ? 'Rabi' : 'Zaid');
          const matchesLand = selectedLandType === 'all' || c.suitable_land_types?.includes(selectedLandType);
          return matchesSeason && matchesLand;
        }).length} crops)`}>
          <div className="space-y-2">
            {dbCrops
              .filter(c => {
                const matchesSeason = c.season?.includes(selectedSeason === 'kharif' ? 'Kharif' : selectedSeason === 'rabi' ? 'Rabi' : 'Zaid');
                const matchesLand = selectedLandType === 'all' || c.suitable_land_types?.includes(selectedLandType);
                return matchesSeason && matchesLand;
              })
              .slice(0, 10)
              .map((crop) => (
                <Card key={crop.id} className="bg-secondary/30">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{crop.name_en}</p>
                        {crop.name_ta && <p className="text-xs text-muted-foreground">{crop.name_ta}</p>}
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">{crop.category}</Badge>
                        {crop.water_requirement && (
                          <Badge variant="outline" className="text-xs">
                            <Droplets className="w-2 h-2 mr-0.5" />{crop.water_requirement}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {crop.growth_duration_days && (
                      <p className="text-xs text-muted-foreground mt-1">📅 {crop.growth_duration_days} days</p>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </PageSection>
      )}

      {isAIMode && aiRecommendations.length > 0 && (
        <PageSection title="🤖 AI Recommendations">
          <div className="space-y-3">
            {aiRecommendations.map((rec, index) => (
              <Card key={index} className="border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-3xl shrink-0">
                      🌱
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{rec.crop_name}</h3>
                        <Badge className="bg-primary/20 text-primary">AI Pick</Badge>
                      </div>
                      {rec.local_name && (
                        <p className="text-sm text-muted-foreground">{rec.local_name}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className={getWaterBadgeColor(rec.water_requirement)}>
                          <Droplets className="w-3 h-3 mr-1" />
                          {rec.water_requirement} water
                        </Badge>
                        <Badge variant="outline" className={getProfitBadgeColor(rec.profit_potential)}>
                          💰 {rec.profit_potential} profit
                        </Badge>
                        {rec.growth_duration && (
                          <Badge variant="outline">
                            📅 {rec.growth_duration}
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {rec.reason}
                      </p>
                      {rec.yield && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Expected: {rec.yield}
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

      {/* Default Recommendations */}
      {!isAIMode && (
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
                      <p className="text-sm text-muted-foreground">{crop.nameLocal} • {crop.scientificName}</p>
                      
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
      )}

      {filteredCrops.length === 0 && !isAIMode && (
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
