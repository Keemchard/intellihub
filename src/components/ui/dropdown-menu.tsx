"use client";
import * as React from "react";
import * as DM from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = DM.Root;
export const DropdownMenuTrigger = DM.Trigger;
export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof DM.Content>, React.ComponentPropsWithoutRef<typeof DM.Content>>(
  ({ className, sideOffset = 8, ...props }, ref) => (
    <DM.Portal>
      <DM.Content ref={ref} sideOffset={sideOffset}
        className={cn("z-50 min-w-56 rounded-2xl border border-border bg-popover p-2 text-popover-foreground shadow-float animate-fadein", className)}
        {...props} />
    </DM.Portal>
  ),
);
DropdownMenuContent.displayName = "DropdownMenuContent";
export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof DM.Item>, React.ComponentPropsWithoutRef<typeof DM.Item>>(
  ({ className, ...props }, ref) => (
    <DM.Item ref={ref}
      className={cn("flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground outline-none transition hover:bg-muted hover:text-foreground", className)}
      {...props} />
  ),
);
DropdownMenuItem.displayName = "DropdownMenuItem";
export function DropdownMenuSeparator() { return <div className="my-1 h-px bg-border" />; }
