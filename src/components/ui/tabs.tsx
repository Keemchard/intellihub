"use client";
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={cn("inline-flex items-center gap-1 border-b border-border", className)} {...props} />
  ),
);
TabsList.displayName = "TabsList";
export const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative px-4 py-2.5 text-sm font-semibold text-muted-foreground transition ring-focus data-[state=active]:text-primary",
        "after:absolute after:inset-x-3 after:-bottom-px after:h-[2.5px] after:rounded-full after:opacity-0 data-[state=active]:after:opacity-100 data-[state=active]:after:grad-brand",
        className,
      )}
      {...props}
    />
  ),
);
TabsTrigger.displayName = "TabsTrigger";
export const TabsContent = TabsPrimitive.Content;
