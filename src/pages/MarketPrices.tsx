import { useState } from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, Search, MapPin } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

interface CropPrice {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  unit: string;
  change: number;
  changePercent: number;
  market: string;
  category: 'grains' | 'vegetables' | 'fruits' | 'oilseeds';
}

export default function MarketPrices() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock market data (will be replaced with real API)
  const cropPrices: CropPrice[] = [
    { id: '1', name: 'Wheat', nameHi: 'गेहूं', price: 2450, unit: 'quintal', change: 50, changePercent: 2.1, market: 'Delhi', category: 'grains' },
    { id: '2', name: 'Rice', nameHi: 'चावल', price: 3200, unit: 'quintal', change: -30, changePercent: -0.9, market: 'Kolkata', category: 'grains' },
    { id: '3', name: 'Cotton', nameHi: 'कपास', price: 7800, unit: 'quintal', change: 120, changePercent: 1.6, market: 'Ahmedabad', category: 'oilseeds' },
    { id: '4', name: 'Groundnut', nameHi: 'मूंगफली', price: 5600, unit: 'quintal', change: -80, changePercent: -1.4, market: 'Rajkot', category: 'oilseeds' },
    { id: '5', name: 'Tomato', nameHi: 'टमाटर', price: 3500, unit: 'quintal', change: 200, changePercent: 6.1, market: 'Bangalore', category: 'vegetables' },
    { id: '6', name: 'Onion', nameHi: 'प्याज', price: 2100, unit: 'quintal', change: -150, changePercent: -6.7, market: 'Nashik', category: 'vegetables' },
    { id: '7', name: 'Potato', nameHi: 'आलू', price: 1800, unit: 'quintal', change: 30, changePercent: 1.7, market: 'Agra', category: 'vegetables' },
    { id: '8', name: 'Mango', nameHi: 'आम', price: 4500, unit: 'quintal', change: 100, changePercent: 2.3, market: 'Lucknow', category: 'fruits' },
  ];

  const filteredPrices = cropPrices.filter((crop) => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      crop.nameHi.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'grains', label: 'Grains' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'oilseeds', label: 'Oilseeds' },
  ];

  return (
    <PageContainer>
      <AppHeader title={t('marketPrices')} />

      {/* Search */}
      <PageSection>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search crops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </PageSection>

      {/* Category Tabs */}
      <PageSection>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </PageSection>

      {/* Price List */}
      <PageSection title="Today's Prices">
        <div className="space-y-3">
          {filteredPrices.map((crop) => (
            <Card key={crop.id} className="hover:shadow-card-hover transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{crop.name}</h3>
                      <span className="text-sm text-muted-foreground">({crop.nameHi})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{crop.market}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">₹{crop.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">per {crop.unit}</p>
                    <Badge
                      variant={crop.change >= 0 ? 'default' : 'destructive'}
                      className={`mt-1 ${crop.change >= 0 ? 'bg-success hover:bg-success/90' : ''}`}
                    >
                      {crop.change >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {crop.change >= 0 ? '+' : ''}{crop.changePercent}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageSection>

      {/* Market Summary */}
      <PageSection title="Market Summary">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-success/10 border-success/30">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-success">5</p>
              <p className="text-sm text-muted-foreground">Prices Up</p>
            </CardContent>
          </Card>
          <Card className="bg-destructive/10 border-destructive/30">
            <CardContent className="p-4 text-center">
              <TrendingDown className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-2xl font-bold text-destructive">3</p>
              <p className="text-sm text-muted-foreground">Prices Down</p>
            </CardContent>
          </Card>
        </div>
      </PageSection>

      <BottomNav />
    </PageContainer>
  );
}
