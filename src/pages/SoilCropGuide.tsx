import { useState, useEffect } from 'react';
import { Loader2, Leaf, Droplets, Mountain, Sparkles, Beaker } from 'lucide-react';
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

interface SoilCrop {
  crop_name: string;
  suitability_score: number;
  season: string;
  water_requirement: string;
  fertilizer_n: number;
  fertilizer_p: number;
  fertilizer_k: number;
  expected_yield: string;
  growth_days: number;
  tips: string;
}

const SOIL_TYPES = [
  { value: 'Black Soil', label: 'Black Soil (கருப்பு மண்)', icon: '⬛', desc: 'Rich in calcium, potassium. Best for cotton, soybean' },
  { value: 'Alluvial', label: 'Alluvial Soil (வண்டல் மண்)', icon: '🟫', desc: 'Fertile, good for paddy, wheat, sugarcane' },
  { value: 'Red Soil', label: 'Red Soil (சிவப்பு மண்)', icon: '🟥', desc: 'Rich in iron. Good for groundnut, millets' },
  { value: 'Sandy Loam', label: 'Sandy / Sandy Loam (மணல் மண்)', icon: '🟨', desc: 'Well-drained. Good for root vegetables, groundnut' },
  { value: 'Laterite', label: 'Laterite Soil (லேட்டரைட்)', icon: '🟧', desc: 'Acidic, low fertility. Good for tea, cashew, coconut' },
  { value: 'Loamy', label: 'Loamy Soil (களிமண்)', icon: '🟩', desc: 'Best all-round soil. Ideal for most crops' },
];

export default function SoilCropGuide() {
  const { t, language } = useLanguage();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [selectedSoil, setSelectedSoil] = useState('');
  const [soilPh, setSoilPh] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [season, setSeason] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SoilCrop[]>([]);

  const getRecommendations = async () => {
    if (!selectedSoil) {
      toast({ variant: 'destructive', title: 'Select Soil Type', description: 'Please choose your soil type' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('crop-advisor', {
        body: {
          type: 'soil_crop_guide',
          data: {
            soilType: selectedSoil,
            soilPh: soilPh || undefined,
            nitrogen: nitrogen || undefined,
            phosphorus: phosphorus || undefined,
            potassium: potassium || undefined,
            season: season === 'all' ? undefined : season,
            state: profile?.state || 'Tamil Nadu',
            district: profile?.district || '',
          },
          language,
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.crops) {
        setResults(data.data.crops);
        toast({ title: 'Analysis Complete', description: `${data.data.crops.length} crops matched for ${selectedSoil}` });
      } else {
        throw new Error(data?.error || 'Failed to get recommendations');
      }
    } catch (error: any) {
      console.error('Soil guide error:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to get recommendations' });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-success/20 text-success';
    if (score >= 5) return 'bg-warning/20 text-warning';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <PageContainer>
      <AppHeader title="Soil-Based Crop Guide" />

      <PageSection>
        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mountain className="w-6 h-6 text-primary" />
              <h3 className="font-semibold">Select Your Soil Type</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your soil type to get matching crops with fertilizer advice from ICAR data.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SOIL_TYPES.map((soil) => (
                <button
                  key={soil.value}
                  onClick={() => setSelectedSoil(soil.value)}
                  className={`p-3 rounded-xl text-left transition-all border-2 ${
                    selectedSoil === soil.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:bg-secondary'
                  }`}
                >
                  <span className="text-2xl">{soil.icon}</span>
                  <p className="font-medium text-sm mt-1">{soil.label.split('(')[0]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{soil.desc.substring(0, 40)}...</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Optional Soil Test Values */}
      <PageSection title="Soil Test Values (Optional)">
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Soil pH</Label>
                <Input type="number" step="0.1" placeholder="e.g., 6.5" value={soilPh} onChange={e => setSoilPh(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs">Season</Label>
                <Select value={season} onValueChange={setSeason}>
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Seasons</SelectItem>
                    <SelectItem value="Kharif">Kharif (Jun-Oct)</SelectItem>
                    <SelectItem value="Rabi">Rabi (Oct-Mar)</SelectItem>
                    <SelectItem value="Zaid">Zaid (Mar-Jun)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">N (kg/ha)</Label>
                <Input type="number" placeholder="N" value={nitrogen} onChange={e => setNitrogen(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs">P (kg/ha)</Label>
                <Input type="number" placeholder="P" value={phosphorus} onChange={e => setPhosphorus(e.target.value)} className="h-10" />
              </div>
              <div>
                <Label className="text-xs">K (kg/ha)</Label>
                <Input type="number" placeholder="K" value={potassium} onChange={e => setPotassium(e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection>
        <Button onClick={getRecommendations} disabled={isLoading} className="w-full h-14 text-lg gap-2">
          {isLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" />Analyzing Soil...</>
          ) : (
            <><Sparkles className="w-5 h-5" />Get Crop Recommendations</>
          )}
        </Button>
      </PageSection>

      {/* Results */}
      {results.length > 0 && (
        <PageSection title={`Recommended Crops for ${selectedSoil} (${results.length})`}>
          <div className="space-y-3">
            {results.map((crop, idx) => (
              <Card key={idx} className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{crop.crop_name}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="outline">{crop.season}</Badge>
                        <Badge variant="outline" className={
                          crop.water_requirement?.toLowerCase() === 'low' ? 'bg-warning/20 text-warning' :
                          crop.water_requirement?.toLowerCase() === 'high' ? 'bg-info/20 text-info' :
                          'bg-muted'
                        }>
                          <Droplets className="w-3 h-3 mr-1" />
                          {crop.water_requirement}
                        </Badge>
                        {crop.growth_days && (
                          <Badge variant="outline">📅 {crop.growth_days} days</Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={`text-lg px-3 ${getScoreColor(crop.suitability_score)}`}>
                      {crop.suitability_score}/10
                    </Badge>
                  </div>

                  {/* Fertilizer Dose */}
                  <div className="bg-secondary/50 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Beaker className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">Fertilizer Dose (kg/ha)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-background rounded p-2">
                        <p className="text-xs text-muted-foreground">Nitrogen (N)</p>
                        <p className="font-bold text-primary">{crop.fertilizer_n || '-'}</p>
                      </div>
                      <div className="bg-background rounded p-2">
                        <p className="text-xs text-muted-foreground">Phosphorus (P)</p>
                        <p className="font-bold text-primary">{crop.fertilizer_p || '-'}</p>
                      </div>
                      <div className="bg-background rounded p-2">
                        <p className="text-xs text-muted-foreground">Potassium (K)</p>
                        <p className="font-bold text-primary">{crop.fertilizer_k || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {crop.expected_yield && (
                    <p className="text-sm text-muted-foreground mt-2">
                      <Leaf className="w-3 h-3 inline mr-1" />
                      Expected Yield: {crop.expected_yield}
                    </p>
                  )}
                  {crop.tips && (
                    <p className="text-xs text-muted-foreground mt-1 italic">💡 {crop.tips}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
