import { Suspense } from "react";
import { MarketplaceClient } from "@/features/marketplace/marketplace-client";

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceClient />
    </Suspense>
  );
}
