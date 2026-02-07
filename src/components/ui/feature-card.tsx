import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'info' | 'primary';
  href?: string;
}

const variantStyles = {
  default: 'border-border',
  success: 'border-success/30 bg-success/5',
  warning: 'border-warning/30 bg-warning/5',
  info: 'border-info/30 bg-info/5',
  primary: 'border-primary/30 bg-primary/5',
};

const iconBgStyles = {
  default: 'bg-secondary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  info: 'bg-info/20 text-info',
  primary: 'bg-primary/20 text-primary',
};

export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ icon: Icon, title, description, variant = 'default', className, onClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick(e as any);
          }
        }}
        className={cn(
          'feature-card flex items-center gap-4 cursor-pointer',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-xl shrink-0',
            iconBgStyles[variant]
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-foreground truncate">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

FeatureCard.displayName = "FeatureCard";
