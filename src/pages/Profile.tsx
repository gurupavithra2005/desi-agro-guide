import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  Settings,
  MapPin,
  Droplets,
  Mountain,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Profile() {
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: 'Failed to logout. Please try again.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleBadgeVariant = () => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'officer':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'officer':
        return 'Agricultural Officer';
      default:
        return 'Farmer';
    }
  };

  const menuItems = [
    { icon: User, label: 'Edit Profile', path: '/profile/edit' },
    { icon: MapPin, label: 'My Location', path: '/profile/location' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  return (
    <PageContainer>
      <AppHeader title={t('profile')} />

      {/* Profile Card */}
      <PageSection>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20 border-4 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.full_name || 'Welcome!'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user?.phone || user?.email}
                </p>
                <Badge variant={getRoleBadgeVariant()} className="mt-2">
                  {getRoleLabel()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageSection>

      {/* Farm Details */}
      {profile && (profile.village || profile.land_size_acres || profile.land_type) && (
        <PageSection title="Farm Details">
          <Card>
            <CardContent className="p-4 space-y-3">
              {profile.village && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {profile.village}
                      {profile.district && `, ${profile.district}`}
                      {profile.state && `, ${profile.state}`}
                    </p>
                  </div>
                </div>
              )}
              {profile.land_size_acres && (
                <div className="flex items-center gap-3">
                  <Mountain className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Land Size</p>
                    <p className="font-medium">{profile.land_size_acres} acres</p>
                  </div>
                </div>
              )}
              {profile.land_type && (
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Land Type</p>
                    <p className="font-medium capitalize">{profile.land_type} Land</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PageSection>
      )}

      {/* Language Selection */}
      <PageSection title={t('selectLanguage')}>
        <Card>
          <CardContent className="p-4">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <span className="font-medium">
                      {LANGUAGES.find(l => l.code === language)?.nativeName}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('selectLanguage')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2 mt-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        language === lang.code
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      <span className="font-medium">{lang.nativeName}</span>
                      <span className="text-sm text-muted-foreground">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </PageSection>

      {/* Menu Items */}
      <PageSection>
        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, index) => (
              <div key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-secondary"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>
      </PageSection>

      {/* Logout */}
      <PageSection>
        <Button
          variant="destructive"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full h-12 text-base gap-2"
        >
          <LogOut className="w-5 h-5" />
          {isLoggingOut ? t('loading') : t('logout')}
        </Button>
      </PageSection>

      <BottomNav />
    </PageContainer>
  );
}
