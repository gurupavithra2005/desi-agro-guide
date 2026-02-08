import { useState } from 'react';
import { Droplets, Leaf, FlaskConical, Calendar, Calculator, Loader2, ChevronRight, AlertCircle } from 'lucide-react';
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

export default function FertilizerAdvice() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<FertilizerRecommendation[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

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
    { value: 'rice', label: 'Rice (धान)' },
    { value: 'wheat', label: 'Wheat (गेहूं)' },
    { value: 'cotton', label: 'Cotton (कपास)' },
    { value: 'groundnut', label: 'Groundnut (मूंगफली)' },
    { value: 'tomato', label: 'Tomato (टमाटर)' },
    { value: 'maize', label: 'Maize (मक्का)' },
    { value: 'sugarcane', label: 'Sugarcane (गन्ना)' },
    { value: 'soybean', label: 'Soybean (सोयाबीन)' },
  ];

  const growthStages = [
    { value: 'basal', label: 'Basal (Before Sowing)' },
    { value: 'vegetative', label: 'Vegetative Stage' },
    { value: 'flowering', label: 'Flowering Stage' },
    { value: 'fruiting', label: 'Fruiting Stage' },
  ];

  const handleSubmit = async () => {
    if (!formData.crop) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a crop' });
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
        toast({ title: 'Success', description: 'Fertilizer recommendations generated!' });
      } else {
        throw new Error(data?.error || 'Failed to get recommendations');
      }
    } catch (error: any) {
      console.error('Fertilizer advice error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
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
              <p className="font-medium">STCR-Based Recommendations</p>
              <p className="text-sm text-muted-foreground">
                Get personalized fertilizer advice based on your soil test results and target yield using Soil Test Crop Response methodology.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Input Form */}
      <PageSection title="Farm Details">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Crop</Label>
                <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop) => (
                      <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Land Size (acres)</Label>
                  <Input
                    type="number"
                    value={formData.landSize}
                    onChange={(e) => setFormData({ ...formData, landSize: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div>
                  <Label>Growth Stage</Label>
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
      <PageSection title="Soil Test Results (Optional)">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Soil pH</Label>
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
                <Label>Organic Carbon (%)</Label>
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
                <Label>N (kg/ha)</Label>
                <Input
                  type="number"
                  placeholder="Nitrogen"
                  value={formData.nitrogen}
                  onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Label>P (kg/ha)</Label>
                <Input
                  type="number"
                  placeholder="Phosphorus"
                  value={formData.phosphorus}
                  onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                  className="h-12"
                />
              </div>
              <div>
                <Label>K (kg/ha)</Label>
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
              <p className="text-sm text-muted-foreground">
                Don't have soil test results? Get free testing through the Soil Health Card scheme.
              </p>
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
              Analyzing...
            </>
          ) : (
            <>
              <Calculator className="w-5 h-5" />
              Get Fertilizer Advice
            </>
          )}
        </Button>
      </PageSection>

      {/* Results */}
      {recommendations.length > 0 && (
        <PageSection title="Recommended Fertilizers">
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
                        Method: {rec.method}
                      </p>
                      {rec.cost && (
                        <p className="text-sm font-medium text-success mt-1">
                          Est. Cost: {rec.cost}
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
        <PageSection title="Application Schedule">
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
                      <Badge variant="outline">{item.days} DAS</Badge>
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
