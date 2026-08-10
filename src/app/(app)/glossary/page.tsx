import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { GlossaryClient } from "@/features/bigquery/glossary-client";

export default async function GlossaryPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  return <GlossaryClient />;
}
