import { useState, useRef } from 'react';
import { Camera, Upload, Bug, AlertTriangle, Loader2, Leaf, ShieldCheck, Pill } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DetectionResult {
  pest: string;
  confidence: number;
  severity: string;
  treatment: string[];
  organic_alternatives: string[];
  prevention: string[];
}

export default function PestDetection() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [result, setResult] = useState<DetectionResult | null>(null);

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
    { value: 'leaves', label: 'Leaves' },
    { value: 'stem', label: 'Stem' },
    { value: 'roots', label: 'Roots' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'flowers', label: 'Flowers' },
    { value: 'whole_plant', label: 'Whole Plant' },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Please upload an image under 5MB' });
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
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a crop and describe symptoms or upload a photo' });
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
        setResult({
          pest: data.data.pest || data.data.identification || 'Unknown',
          confidence: data.data.confidence || 0.8,
          severity: data.data.severity || 'medium',
          treatment: data.data.treatment || data.data.chemical_control || [],
          organic_alternatives: data.data.organic_alternatives || data.data.biological_control || [],
          prevention: data.data.prevention || data.data.preventive_measures || [],
        });
        toast({ title: 'Analysis Complete', description: selectedImage ? 'Image analyzed with AI vision!' : 'Pest/disease identified!' });
      } else {
        throw new Error(data?.error || 'Failed to analyze');
      }
    } catch (error: any) {
      console.error('Pest detection error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to analyze pest/disease',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'low': return 'bg-success/20 text-success border-success/30';
      case 'medium': return 'bg-warning/20 text-warning border-warning/30';
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'critical': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('pestDetection')} />

      <PageSection>
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-4 flex items-start gap-3">
            <Bug className="w-8 h-8 text-warning shrink-0 mt-1" />
            <div>
              <p className="font-medium">AI-Powered Detection with Vision</p>
              <p className="text-sm text-muted-foreground">
                Upload a photo of your crop for AI image analysis, or describe symptoms for instant pest identification with ICAR-recommended treatments.
              </p>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Image Upload */}
      <PageSection title="Upload Crop Photo">
        <Card>
          <CardContent className="p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {selectedImage ? (
              <div className="relative">
                <img src={selectedImage} alt="Selected" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className="bg-success">📸 Image ready for AI analysis</Badge>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-24 flex-col gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-24 flex-col gap-2"
                >
                  <Upload className="w-8 h-8" />
                  <span>Upload Image</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </PageSection>

      {/* Symptom Form */}
      <PageSection title="Describe Symptoms">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <Label>Crop</Label>
              <Select value={formData.crop} onValueChange={(v) => setFormData({ ...formData, crop: v })}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select affected crop" />
                </SelectTrigger>
                <SelectContent>
                  {crops.map((crop) => (
                    <SelectItem key={crop.value} value={crop.value}>{crop.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Symptoms Description {selectedImage ? '(optional with photo)' : ''}</Label>
              <Textarea
                placeholder="Describe what you observe: yellowing leaves, spots, wilting, holes, etc."
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Affected Part</Label>
                <Select value={formData.affectedPart} onValueChange={(v) => setFormData({ ...formData, affectedPart: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {affectedParts.map((part) => (
                      <SelectItem key={part.value} value={part.value}>{part.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Spread</Label>
                <Select value={formData.spread} onValueChange={(v) => setFormData({ ...formData, spread: v })}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="localized">Localized (few plants)</SelectItem>
                    <SelectItem value="spreading">Spreading</SelectItem>
                    <SelectItem value="widespread">Widespread</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      <PageSection>
        <Button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full h-14 text-lg gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {selectedImage ? 'Analyzing Image with AI Vision...' : 'Analyzing...'}
            </>
          ) : (
            <>
              <Bug className="w-5 h-5" />
              {selectedImage ? 'Analyze Photo with AI' : 'Identify Pest/Disease'}
            </>
          )}
        </Button>
      </PageSection>

      {/* Results */}
      {result && (
        <>
          <PageSection title="Detection Results">
            <Card className="border-2 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{result.pest}</h3>
                    <p className="text-sm text-muted-foreground">
                      Confidence: {Math.round(result.confidence * 100)}%
                    </p>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(result.severity)}>
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    {result.severity.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </PageSection>

          {result.treatment && result.treatment.length > 0 && (
            <PageSection title="Chemical Treatment">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Pill className="w-5 h-5 text-info shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">ICAR-recommended chemical controls</p>
                  </div>
                  <ul className="space-y-2">
                    {(Array.isArray(result.treatment) ? result.treatment : [result.treatment]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-secondary/50 rounded-lg">
                        <span className="w-6 h-6 bg-info/20 text-info rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </PageSection>
          )}

          {result.organic_alternatives && result.organic_alternatives.length > 0 && (
            <PageSection title="Organic Alternatives">
              <Card className="bg-success/5 border-success/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Leaf className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">Eco-friendly control methods</p>
                  </div>
                  <ul className="space-y-2">
                    {(Array.isArray(result.organic_alternatives) ? result.organic_alternatives : [result.organic_alternatives]).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2 bg-success/10 rounded-lg">
                        <span className="w-6 h-6 bg-success/20 text-success rounded-full flex items-center justify-center text-sm font-medium shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </PageSection>
          )}

          {result.prevention && result.prevention.length > 0 && (
            <PageSection title="Prevention Tips">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">Prevent future occurrences</p>
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
