"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { RequestAccessModal } from "@/components/shared/request-access-modal";
import type { DetailProduct } from "@/lib/bigquery-mappers";

export function AccessCTA({
  product,
  size = "default",
}: {
  product: DetailProduct;
  size?: "default" | "lg";
}) {
  const [open, setOpen] = useState(false);

  if (product.accessState === "granted") {
    const launch = () => {
      window.open(product.product_url ?? "", "_blank", "noopener,noreferrer");
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
    <Button size={size} disabled className="cursor-not-allowed !opacity-40" title="Coming in Phase 2">
      <Icon name="shield-check" size={16} /> Request Access
    </Button>
  );
}

export function AccessHint({ product }: { product: DetailProduct }) {
  if (product.accessState !== "pending") return null;
  return (
    <Link
      href="/access"
      className="text-xs font-semibold text-primary hover:underline"
    >
      View request status →
    </Link>
  );
}
