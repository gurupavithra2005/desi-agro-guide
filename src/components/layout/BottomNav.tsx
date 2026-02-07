import { Home, Leaf, Cloud, TrendingUp, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const navItems = [
  { icon: Home, labelKey: 'dashboard' as const, path: '/dashboard' },
  { icon: Leaf, labelKey: 'cropRecommendation' as const, path: '/crops' },
  { icon: Cloud, labelKey: 'weather' as const, path: '/weather' },
  { icon: TrendingUp, labelKey: 'marketPrices' as const, path: '/market' },
  { icon: User, labelKey: 'profile' as const, path: '/profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ icon: Icon, labelKey, path }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center justify-center min-w-[60px] min-h-[56px] rounded-xl transition-all active:scale-95',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-1 truncate max-w-[56px]">
                {t(labelKey).split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
