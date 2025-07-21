"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

const MobileDialog = DialogPrimitive.Root;

const MobileDialogTrigger = DialogPrimitive.Trigger;

const MobileDialogPortal = (props: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
);
MobileDialogPortal.displayName = DialogPrimitive.Portal.displayName;

const MobileDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm",
      className,
    )}
    {...props}
  />
));
MobileDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const MobileDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <MobileDialogPortal>
    <MobileDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200",
        // Desktop styles
        "md:max-w-lg md:rounded-lg",
        // Mobile styles - full screen on small devices
        "mobile:inset-4 mobile:top-4 mobile:left-4 mobile:right-4 mobile:bottom-4 mobile:translate-x-0 mobile:translate-y-0 mobile:max-w-none mobile:w-auto mobile:h-auto mobile:max-h-[calc(100vh-2rem)] mobile:overflow-y-auto mobile:rounded-xl",
        // Touch-friendly spacing
        "mobile:p-6 mobile:gap-6",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
            // Mobile styles - larger close button
            "mobile:right-6 mobile:top-6 mobile:h-8 mobile:w-8",
          )}
        >
          <X className="h-4 w-4 mobile:h-5 mobile:w-5" />
          <span className="sr-only">Close</span>
        </Button>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </MobileDialogPortal>
));
MobileDialogContent.displayName = DialogPrimitive.Content.displayName;

const MobileDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      // Mobile styles
      "mobile:space-y-3 mobile:pb-2",
      className,
    )}
    {...props}
  />
);
MobileDialogHeader.displayName = "MobileDialogHeader";

const MobileDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      // Mobile styles - stack buttons vertically with better spacing
      "mobile:flex-col mobile:space-y-3 mobile:pt-4",
      className,
    )}
    {...props}
  />
);
MobileDialogFooter.displayName = "MobileDialogFooter";

const MobileDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      // Mobile styles
      "mobile:text-xl mobile:leading-tight",
      className,
    )}
    {...props}
  />
));
MobileDialogTitle.displayName = DialogPrimitive.Title.displayName;

const MobileDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-muted-foreground text-sm",
      // Mobile styles
      "mobile:text-base mobile:leading-relaxed",
      className
    )}
    {...props}
  />
));
MobileDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  MobileDialog,
  MobileDialogTrigger,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogFooter,
  MobileDialogTitle,
  MobileDialogDescription,
};
