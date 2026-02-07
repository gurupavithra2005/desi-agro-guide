import * as React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  withBottomNav?: boolean;
  withHeader?: boolean;
}

export function PageContainer({ 
  children, 
  className, 
  withBottomNav = true,
  withHeader = true,
  ...props 
}: PageContainerProps) {
  return (
    <main
      className={cn(
        'min-h-screen bg-background',
        withHeader && 'pt-0',
        withBottomNav && 'pb-24',
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}

interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
}

export function PageSection({ title, children, className, ...props }: PageSectionProps) {
  return (
    <section className={cn('px-4 py-4', className)} {...props}>
      {title && (
        <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      )}
      {children}
    </section>
  );
}
