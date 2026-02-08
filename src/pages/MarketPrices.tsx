import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, MapPin, Bell, BellOff, Loader2, RefreshCw } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function MarketPrices() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertedCrops, setAlertedCrops] = useState<string[]>([]);

  useEffect(() => {
    fetchPrices();
    if (user) fetchAlerts();
  }, [user]);

  const fetchPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('market_prices')
        .select('*')
        .order('price_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPrices(data || []);
    } catch (error) {
      console.error('Failed to fetch prices:', error);
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
    const matchesSearch = price.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      price.market_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group by crop
  const uniqueCrops = [...new Set(filteredPrices.map(p => p.crop_name))];

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'grains', label: 'Grains' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'oilseeds', label: 'Oilseeds' },
  ];

  const pricesUp = filteredPrices.filter(p => (p.change_percent || 0) > 0).length;
  const pricesDown = filteredPrices.filter(p => (p.change_percent || 0) < 0).length;

  return (
    <PageContainer>
      <AppHeader title={t('marketPrices')} />

      {/* Search */}
      <PageSection>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops or markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </PageSection>

      {/* Refresh Button */}
      <PageSection>
        <Button 
          variant="outline" 
          onClick={fetchPrices} 
          className="w-full gap-2"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Prices
        </Button>
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
      <PageSection title="Live Market Prices">
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
              <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
            </CardContent>
          </Card>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
