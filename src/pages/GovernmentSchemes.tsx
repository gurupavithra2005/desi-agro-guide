import { useState, useEffect } from 'react';
import { FileText, ExternalLink, Phone, Search, ChevronRight, CheckCircle, Info, Building2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface Scheme {
  id: string;
  scheme_code: string;
  name_en: string;
  name_hi: string | null;
  description_en: string | null;
  description_hi: string | null;
  scheme_type: string;
  state: string | null;
  benefits: string | null;
  eligibility: string | null;
  how_to_apply: string | null;
  website_url: string | null;
  helpline: string | null;
  icon_name: string | null;
}

export default function GovernmentSchemes() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [schemeType, setSchemeType] = useState('all');
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data, error } = await supabase
        .from('government_schemes')
        .select('*')
        .eq('is_active', true)
        .order('scheme_type', { ascending: true });

      if (error) throw error;
      setSchemes(data || []);
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLocalizedName = (scheme: Scheme) => {
    if (language === 'hi' && scheme.name_hi) return scheme.name_hi;
    return scheme.name_en;
  };

  const getLocalizedDescription = (scheme: Scheme) => {
    if (language === 'hi' && scheme.description_hi) return scheme.description_hi;
    return scheme.description_en;
  };

  const filteredSchemes = schemes.filter((scheme) => {
    const matchesSearch = 
      scheme.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (scheme.name_hi && scheme.name_hi.includes(searchQuery)) ||
      scheme.scheme_code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = schemeType === 'all' || scheme.scheme_type === schemeType;
    return matchesSearch && matchesType;
  });

  const centralSchemes = filteredSchemes.filter(s => s.scheme_type === 'central');
  const stateSchemes = filteredSchemes.filter(s => s.scheme_type === 'state');

  const getIconComponent = (iconName: string | null) => {
    switch (iconName) {
      case 'Banknote': return '💰';
      case 'Shield': return '🛡️';
      case 'FlaskConical': return '🧪';
      case 'Store': return '🏪';
      case 'Droplets': return '💧';
      case 'CreditCard': return '💳';
      default: return '📋';
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('schemes')} />

      {/* Search */}
      <PageSection>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search schemes (PM-KISAN, PMFBY...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </PageSection>

      {/* Tabs */}
      <PageSection>
        <Tabs value={schemeType} onValueChange={setSchemeType}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="central">Central</TabsTrigger>
            <TabsTrigger value="state">State</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageSection>

      {/* Loading */}
      {isLoading && (
        <PageSection>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      )}

      {/* Central Schemes */}
      {!isLoading && centralSchemes.length > 0 && (schemeType === 'all' || schemeType === 'central') && (
        <PageSection title="Central Government Schemes">
          <div className="space-y-3">
            {centralSchemes.map((scheme) => (
              <Card 
                key={scheme.id} 
                className="hover:shadow-card-hover transition-shadow cursor-pointer"
                onClick={() => setSelectedScheme(scheme)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {getIconComponent(scheme.icon_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{getLocalizedName(scheme)}</h3>
                        <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {getLocalizedDescription(scheme)}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        <Building2 className="w-3 h-3 mr-1" />
                        Central
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      )}

      {/* State Schemes */}
      {!isLoading && stateSchemes.length > 0 && (schemeType === 'all' || schemeType === 'state') && (
        <PageSection title="State Schemes">
          <div className="space-y-3">
            {stateSchemes.map((scheme) => (
              <Card 
                key={scheme.id} 
                className="hover:shadow-card-hover transition-shadow cursor-pointer"
                onClick={() => setSelectedScheme(scheme)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {getIconComponent(scheme.icon_name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{getLocalizedName(scheme)}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {getLocalizedDescription(scheme)}
                      </p>
                      <Badge variant="outline" className="mt-2">{scheme.state}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      )}

      {/* Empty State */}
      {!isLoading && filteredSchemes.length === 0 && (
        <PageSection>
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No schemes found</p>
            </CardContent>
          </Card>
        </PageSection>
      )}

      {/* Scheme Details Dialog */}
      <Dialog open={!!selectedScheme} onOpenChange={() => setSelectedScheme(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          {selectedScheme && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {getIconComponent(selectedScheme.icon_name)}
                  </div>
                  <div>
                    <DialogTitle>{getLocalizedName(selectedScheme)}</DialogTitle>
                    <DialogDescription>
                      {selectedScheme.scheme_code}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4" /> About
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getLocalizedDescription(selectedScheme)}
                  </p>
                </div>

                {selectedScheme.benefits && (
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-success" /> Benefits
                    </h4>
                    <p className="text-sm text-muted-foreground">{selectedScheme.benefits}</p>
                  </div>
                )}

                {selectedScheme.eligibility && (
                  <div>
                    <h4 className="font-medium mb-2">Eligibility</h4>
                    <p className="text-sm text-muted-foreground">{selectedScheme.eligibility}</p>
                  </div>
                )}

                {selectedScheme.how_to_apply && (
                  <div>
                    <h4 className="font-medium mb-2">How to Apply</h4>
                    <p className="text-sm text-muted-foreground">{selectedScheme.how_to_apply}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-4">
                  {selectedScheme.website_url && (
                    <Button asChild className="w-full gap-2">
                      <a href={selectedScheme.website_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                        Visit Official Website
                      </a>
                    </Button>
                  )}
                  {selectedScheme.helpline && (
                    <Button variant="outline" asChild className="w-full gap-2">
                      <a href={`tel:${selectedScheme.helpline}`}>
                        <Phone className="w-4 h-4" />
                        Call Helpline: {selectedScheme.helpline}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </PageContainer>
  );
}
