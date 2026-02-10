import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, MapPin, Bell, BellOff, Loader2, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

interface MarketPrice {
  id: string;
  crop_name: string;
  market_name: string;
  state: string;
  district: string | null;
  min_price: number;
  max_price: number;
  modal_price: number;
  unit: string;
  price_date: string;
  previous_price: number | null;
  change_percent: number | null;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thiruvallur", "Thoothukudi", "Tiruchirappalli",
  "Tirunelveli", "Tirupattur", "Tirupur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Villupuram", "Virudhunagar"
];

export default function MarketPrices() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertedCrops, setAlertedCrops] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<'cached' | 'live_api'>('cached');

  useEffect(() => {
    fetchPricesFromDB();
    if (user) fetchAlerts();
  }, [user, selectedState, selectedDistrict]);

  // Initial load from database
  const fetchPricesFromDB = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('market_prices')
        .select('*')
        .order('price_date', { ascending: false })
        .limit(200);

      if (selectedState) query = query.eq('state', selectedState);
      if (selectedDistrict) query = query.eq('district', selectedDistrict);

      const { data, error } = await query;

      if (error) throw error;
      setPrices(data || []);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch live prices from API via edge function
  const fetchLivePrices = async () => {
    if (!selectedState) {
      toast({ variant: 'destructive', title: 'Select State', description: 'Please select a state to fetch live prices' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-prices', {
        body: {
          state: selectedState,
          district: selectedDistrict || undefined,
          commodity: searchQuery || undefined,
        },
      });

      if (error) throw error;

      if (data?.success) {
        setPrices(data.data || []);
        setDataSource(data.source);
        toast({
          title: data.source === 'live_api' ? '✅ Live Prices Updated' : '📦 Cached Prices',
          description: `${data.total} prices found for ${selectedState}${selectedDistrict ? `, ${selectedDistrict}` : ''}`,
        });
      } else {
        throw new Error(data?.error || 'Failed to fetch prices');
      }
    } catch (error: any) {
      console.error('Failed to fetch live prices:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to fetch prices' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('price_alerts')
        .select('crop_name')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setAlertedCrops(data?.map(a => a.crop_name) || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const toggleAlert = async (cropName: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please login to set alerts' });
      return;
    }

    const isAlerted = alertedCrops.includes(cropName);
    try {
      if (isAlerted) {
        const { error } = await supabase
          .from('price_alerts')
          .delete()
          .eq('user_id', user.id)
          .eq('crop_name', cropName);
        if (error) throw error;
        setAlertedCrops(prev => prev.filter(c => c !== cropName));
        toast({ title: 'Alert Removed', description: `Price alerts disabled for ${cropName}` });
      } else {
        const { error } = await supabase.from('price_alerts').insert({
          user_id: user.id,
          crop_name: cropName,
          target_price: 0,
          alert_type: 'above',
        });
        if (error) throw error;
        setAlertedCrops(prev => [...prev, cropName]);
        toast({ title: 'Alert Set', description: `You'll be notified of ${cropName} price changes` });
      }
    } catch (error: any) {
      console.error('Failed to toggle alert:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const filteredPrices = prices.filter((price) => {
    const matchesSearch = !searchQuery || 
      price.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.market_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const pricesUp = filteredPrices.filter(p => (p.change_percent || 0) > 0).length;
  const pricesDown = filteredPrices.filter(p => (p.change_percent || 0) < 0).length;

  return (
    <PageContainer>
      <AppHeader title={t('marketPrices')} />

      {/* State & District Filter */}
      <PageSection title="Search by Location">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs mb-1 block">State</Label>
              <Select value={selectedState} onValueChange={(v) => { setSelectedState(v); setSelectedDistrict(''); }}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">District</Label>
              {selectedState === 'Tamil Nadu' ? (
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {TN_DISTRICTS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter district"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="h-10"
                />
              )}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search crop name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <Button 
            onClick={fetchLivePrices} 
            className="w-full gap-2"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {isLoading ? 'Fetching Live Prices...' : 'Fetch Live Prices from Agmarknet'}
          </Button>

          {dataSource === 'live_api' && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              ✅ Live data from Government API
            </Badge>
          )}
        </div>
      </PageSection>

      {/* Market Summary */}
      <PageSection title="Today's Summary">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">{pricesUp}</p>
              <p className="text-sm text-muted-foreground">Prices Up</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">{pricesDown}</p>
              <p className="text-sm text-muted-foreground">Prices Down</p>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      {/* Price List */}
      <PageSection title={`Market Prices (${filteredPrices.length})`}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-5 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPrices.map((price) => {
              const isAlerted = alertedCrops.includes(price.crop_name);
              const change = price.change_percent || 0;
              
              return (
                <Card key={price.id} className="hover:shadow-card-hover transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{price.crop_name}</h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleAlert(price.crop_name)}
                          >
                            {isAlerted ? (
                              <Bell className="w-4 h-4 text-primary fill-primary" />
                            ) : (
                              <BellOff className="w-4 h-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-3 h-3" />
                          <span>{price.market_name}, {price.state}</span>
                        </div>
                        {price.district && (
                          <p className="text-xs text-muted-foreground ml-4">{price.district}</p>
                        )}
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Min: ₹{price.min_price.toLocaleString()}</span>
                          <span>•</span>
                          <span>Max: ₹{price.max_price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">₹{price.modal_price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">per {price.unit}</p>
                        <Badge
                          variant={change >= 0 ? 'default' : 'destructive'}
                          className={`mt-1 ${change >= 0 ? 'bg-success hover:bg-success/90' : ''}`}
                        >
                          {change >= 0 ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </PageSection>

      {filteredPrices.length === 0 && !isLoading && (
        <PageSection>
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No prices found</p>
              <p className="text-sm text-muted-foreground mt-1">Select a state and click "Fetch Live Prices"</p>
            </CardContent>
          </Card>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
