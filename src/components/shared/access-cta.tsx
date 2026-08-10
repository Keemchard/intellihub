"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { RequestAccessModal } from "@/components/shared/request-access-modal";
import type { Product } from "@/types";

/** Single entitlement-gated control. State resolved server-side via product.accessState. */
export function AccessCTA({ product, size = "default" }: { product: Product; size?: "default" | "lg" }) {
  const [open, setOpen] = useState(false);

  if (product.accessState === "granted") {
    // Synchronous open from a direct click → popup-blocker safe. Fire-and-forget (new tab).
    const launch = () => {
      const url = `${product.launchUrl}${product.id}`;
      window.open(url, "_blank", "noopener,noreferrer");
      // Tranche 2: POST /api/events/deep-link
    };
    return (
      <Button size={size} onClick={launch}>
        <Icon name="external-link" size={16} /> View Data Product
      </Button>
    );
  }

  if (product.accessState === "pending") {
    return (
      <Button size={size} variant="secondary" disabled className="!opacity-100">
        <Icon name="clock" size={16} /> Access In Review
      </Button>
    );
  }

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        <Icon name="shield-check" size={16} /> Request Access
      </Button>
      <RequestAccessModal product={product} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function AccessHint({ product }: { product: Product }) {
  if (product.accessState !== "pending") return null;
  return <Link href="/access" className="text-xs font-semibold text-primary hover:underline">View request status →</Link>;
}
