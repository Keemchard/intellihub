import { KpiDetailClient } from "@/features/bigquery/kpi-detail-client";

export default async function KpiDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KpiDetailClient id={id} />;
}
