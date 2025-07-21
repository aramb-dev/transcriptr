import * as React from "react";
import { cn } from "@/lib/utils";

export interface MobileInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  touchOptimized?: boolean;
}

const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, type, touchOptimized = true, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          touchOptimized && [
            "mobile:h-12 mobile:px-4 mobile:py-3 mobile:text-base",
            "mobile:border-2 mobile:rounded-lg",
            "mobile:focus-visible:ring-4 mobile:focus-visible:ring-offset-1",
            "touch:min-h-touch"
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
MobileInput.displayName = "MobileInput";

export { MobileInput };
