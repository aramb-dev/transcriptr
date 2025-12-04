import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { mobileButtonVariants } from "./mobile-button-variants";

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean;
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(mobileButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
MobileButton.displayName = "MobileButton";

export { MobileButton };
