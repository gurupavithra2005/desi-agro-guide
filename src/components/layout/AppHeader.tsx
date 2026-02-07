import { Bell, Globe, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, LANGUAGES } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface AppHeaderProps {
  title?: string;
  showMenu?: boolean;
  notificationCount?: number;
}

export function AppHeader({ title = 'Crop Wise', showMenu = false, notificationCount = 0 }: AppHeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <header className="sticky top-0 z-40 bg-primary text-primary-foreground safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showMenu && (
            <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
              <Menu className="w-6 h-6" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7" />
            <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary/80">
                <Globe className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {LANGUAGES.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={language === lang.code ? 'bg-secondary' : ''}
                >
                  <span className="flex-1">{lang.nativeName}</span>
                  <span className="text-muted-foreground text-sm">{lang.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary/80">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs p-0"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

// Need to import Leaf icon
import { Leaf } from 'lucide-react';
