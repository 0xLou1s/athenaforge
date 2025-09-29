"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({
  children,
  sidebar,
  header,
  className,
}: ResponsiveLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            {sidebar && (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                  >
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="pr-0 w-[280px]">
                  {sidebar}
                </SheetContent>
              </Sheet>
            )}
            {header}
          </div>
        </header>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        {sidebar && (
          <aside className="hidden md:flex w-64 flex-col border-r bg-muted/10">
            <div className="flex-1 overflow-auto py-6 px-4">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { default: 1, md: 2, lg: 3 },
  gap = 6,
  className,
}: ResponsiveGridProps) {
  const gridClasses = [
    `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    `gap-${gap}`,
  ].filter(Boolean).join(" ");

  return (
    <div className={cn("grid", gridClasses, className)}>
      {children}
    </div>
  );
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function ResponsiveContainer({
  children,
  size = "lg",
  className,
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl", 
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div className={cn(
      "mx-auto px-4 sm:px-6 lg:px-8",
      sizeClasses[size],
      className
    )}>
      {children}
    </div>
  );
}

interface MobileFirstCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function MobileFirstCard({
  children,
  title,
  description,
  actions,
  className,
}: MobileFirstCardProps) {
  return (
    <div className={cn(
      "bg-card border rounded-lg shadow-sm",
      "p-4 sm:p-6",
      className
    )}>
      {(title || description || actions) && (
        <div className={cn(
          "flex flex-col gap-2 mb-4",
          "sm:flex-row sm:items-center sm:justify-between"
        )}>
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex gap-2 sm:flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Hook for responsive breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<string>("sm");

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1280) setBreakpoint("xl");
      else if (width >= 1024) setBreakpoint("lg");
      else if (width >= 768) setBreakpoint("md");
      else if (width >= 640) setBreakpoint("sm");
      else setBreakpoint("xs");
    };

    updateBreakpoint();
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isXs: breakpoint === "xs",
    isSm: breakpoint === "sm",
    isMd: breakpoint === "md", 
    isLg: breakpoint === "lg",
    isXl: breakpoint === "xl",
    isMobile: ["xs", "sm"].includes(breakpoint),
    isTablet: breakpoint === "md",
    isDesktop: ["lg", "xl"].includes(breakpoint),
  };
}

// Mobile-optimized form layout
interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveForm({ children, className }: ResponsiveFormProps) {
  return (
    <div className={cn(
      "space-y-4 sm:space-y-6",
      "w-full max-w-2xl mx-auto",
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized table wrapper
interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({ children, className }: ResponsiveTableProps) {
  return (
    <div className={cn(
      "w-full overflow-auto",
      "border rounded-lg",
      className
    )}>
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
}

// Stack layout for mobile
interface StackLayoutProps {
  children: React.ReactNode;
  direction?: "vertical" | "horizontal";
  spacing?: number;
  className?: string;
}

export function StackLayout({
  children,
  direction = "vertical",
  spacing = 4,
  className,
}: StackLayoutProps) {
  const isVertical = direction === "vertical";
  
  return (
    <div className={cn(
      "flex",
      isVertical ? "flex-col" : "flex-row flex-wrap",
      `gap-${spacing}`,
      className
    )}>
      {children}
    </div>
  );
}
