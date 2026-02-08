import { useState, useEffect } from 'react';
import { Map, Plus, Edit2, Trash2, Leaf, Droplets, Mountain, MapPin, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Field {
  id: string;
  field_name: string;
  area_acres: number | null;
  land_type: string | null;
  soil_type: string | null;
  irrigation_type: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function MyFields() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [fields, setFields] = useState<Field[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [formData, setFormData] = useState({
    field_name: '',
    area_acres: '',
    land_type: '',
    soil_type: '',
    irrigation_type: '',
  });

  useEffect(() => {
    if (user) fetchFields();
  }, [user]);

  const fetchFields = async () => {
    try {
      const { data, error } = await supabase
        .from('farmer_fields')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFields(data || []);
    } catch (error) {
      console.error('Failed to fetch fields:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (field?: Field) => {
    if (field) {
      setEditingField(field);
      setFormData({
        field_name: field.field_name,
        area_acres: field.area_acres?.toString() || '',
        land_type: field.land_type || '',
        soil_type: field.soil_type || '',
        irrigation_type: field.irrigation_type || '',
      });
    } else {
      setEditingField(null);
      setFormData({
        field_name: '',
        area_acres: '',
        land_type: '',
        soil_type: '',
        irrigation_type: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!formData.field_name.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Field name is required' });
      return;
    }

    setIsSubmitting(true);
    try {
      const validLandTypes = ['dry', 'wet', 'garden'] as const;
      const landType = validLandTypes.includes(formData.land_type as any) 
        ? formData.land_type as 'dry' | 'wet' | 'garden' 
        : null;

      const fieldData = {
        user_id: user.id,
        field_name: formData.field_name,
        area_acres: formData.area_acres ? parseFloat(formData.area_acres) : null,
        land_type: landType,
        soil_type: formData.soil_type || null,
        irrigation_type: formData.irrigation_type || null,
      };

      if (editingField) {
        const { error } = await supabase
          .from('farmer_fields')
          .update(fieldData)
          .eq('id', editingField.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Field updated successfully!' });
      } else {
        const { error } = await supabase.from('farmer_fields').insert([fieldData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Field added successfully!' });
      }

      setIsDialogOpen(false);
      fetchFields();
    } catch (error: any) {
      console.error('Failed to save field:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save field' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (fieldId: string) => {
    try {
      const { error } = await supabase.from('farmer_fields').delete().eq('id', fieldId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Field deleted successfully!' });
      fetchFields();
    } catch (error: any) {
      console.error('Failed to delete field:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete field' });
    }
  };

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          toast({ title: 'Location captured', description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}` });
        },
        (error) => {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to get location' });
        }
      );
    }
  };

  const getLandTypeIcon = (type: string | null) => {
    switch (type) {
      case 'wet': return '💧';
      case 'dry': return '🏜️';
      case 'garden': return '🌳';
      default: return '🌾';
    }
  };

  return (
    <PageContainer>
      <AppHeader title={t('myFields')} />

      {/* Add Field Button */}
      <PageSection>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 gap-2" onClick={() => handleOpenDialog()}>
              <Plus className="w-5 h-5" />
              Add New Field
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingField ? 'Edit Field' : 'Add New Field'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Field Name *</Label>
                <Input
                  placeholder="e.g., North Plot, Farm 1"
                  value={formData.field_name}
                  onChange={(e) => setFormData({ ...formData, field_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Area (acres)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 2.5"
                    value={formData.area_acres}
                    onChange={(e) => setFormData({ ...formData, area_acres: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Land Type</Label>
                  <Select value={formData.land_type} onValueChange={(v) => setFormData({ ...formData, land_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry">🏜️ Dry Land</SelectItem>
                      <SelectItem value="wet">💧 Wet Land</SelectItem>
                      <SelectItem value="garden">🌳 Garden Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Soil Type</Label>
                  <Select value={formData.soil_type} onValueChange={(v) => setFormData({ ...formData, soil_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alluvial">Alluvial</SelectItem>
                      <SelectItem value="black">Black (Regur)</SelectItem>
                      <SelectItem value="red">Red Soil</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                      <SelectItem value="clayey">Clayey</SelectItem>
                      <SelectItem value="laterite">Laterite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Irrigation</Label>
                  <Select value={formData.irrigation_type} onValueChange={(v) => setFormData({ ...formData, irrigation_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainfed">Rainfed</SelectItem>
                      <SelectItem value="canal">Canal</SelectItem>
                      <SelectItem value="borewell">Borewell</SelectItem>
                      <SelectItem value="drip">Drip</SelectItem>
                      <SelectItem value="sprinkler">Sprinkler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={getLocation} variant="outline" className="w-full gap-2">
                <MapPin className="w-4 h-4" />
                Capture GPS Location
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editingField ? 'Update Field' : 'Add Field'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageSection>

      {/* Fields List */}
      {isLoading ? (
        <PageSection>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-5 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      ) : fields.length > 0 ? (
        <PageSection title={`My Fields (${fields.length})`}>
          <div className="space-y-3">
            {fields.map((field) => (
              <Card key={field.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {getLandTypeIcon(field.land_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{field.field_name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {field.area_acres && (
                            <Badge variant="secondary">
                              <Mountain className="w-3 h-3 mr-1" />
                              {field.area_acres} acres
                            </Badge>
                          )}
                          {field.land_type && (
                            <Badge variant="outline" className="capitalize">
                              {field.land_type} land
                            </Badge>
                          )}
                          {field.irrigation_type && (
                            <Badge variant="outline">
                              <Droplets className="w-3 h-3 mr-1" />
                              {field.irrigation_type}
                            </Badge>
                          )}
                        </div>
                        {field.soil_type && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Soil: {field.soil_type}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(field)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Field?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{field.field_name}" and all associated data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(field.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      ) : (
        <PageSection>
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <Map className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No fields added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your farm plots to get personalized recommendations</p>
            </CardContent>
          </Card>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
