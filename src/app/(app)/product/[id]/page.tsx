import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { ProductDetailClient } from "@/features/bigquery/product-detail-client";

export default async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;
  return <ProductDetailClient id={id} />;
}
