"use client";
import * as React from "react";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export function DialogContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof D.Content>) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm data-[state=open]:animate-fadein" />
      <D.Content
        className={cn("fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-float data-[state=open]:animate-fadein", className)}
        {...props}>
        {children}
        <D.Close className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition hover:bg-muted"><X size={18} /></D.Close>
      </D.Content>
    </D.Portal>
  );
}
export const DialogTitle = D.Title;
export const DialogDescription = D.Description;
