import * as React from "react";

import { cn } from "@/lib/utils";

const CardHover = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative -mb-[1px] -ml-[1px] -mr-[1px] -mt-[1px] border-l border-r border-t bg-card text-card-foreground transition-all duration-150 ease-in-out hover:z-10 hover:-translate-x-2 hover:-translate-y-1 hover:border-b",
      className
    )}
    {...props}
  />
));
CardHover.displayName = "CardHover";

export { CardHover };
