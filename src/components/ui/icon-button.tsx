import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const variantStyles = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-button',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border-2 border-border bg-background hover:bg-secondary',
  ghost: 'hover:bg-secondary',
  success: 'bg-success text-success-foreground hover:bg-success/90 shadow-button',
  warning: 'bg-warning text-warning-foreground hover:bg-warning/90 shadow-button',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-button',
};

const sizeStyles = {
  sm: 'min-w-[44px] min-h-[44px] p-2',
  md: 'min-w-[56px] min-h-[56px] p-3',
  lg: 'min-w-[64px] min-h-[64px] p-4',
  xl: 'min-w-[72px] min-h-[72px] p-5',
};

const iconSizes = {
  sm: 'w-5 h-5',
  md: 'w-6 h-6',
  lg: 'w-7 h-7',
  xl: 'w-8 h-8',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, label, variant = 'primary', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          variantStyles[variant],
          sizeStyles[size],
          label && 'min-h-[80px] px-4',
          className
        )}
        {...props}
      >
        <Icon className={cn(iconSizes[size])} />
        {label && (
          <span className="text-xs font-medium text-center leading-tight max-w-[80px] truncate">
            {label}
          </span>
        )}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";
