import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/topbar";
import { BotWidget } from "@/features/intellibot/bot-widget";
import { getSession } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware guards the edge, the shell re-checks the session.
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={{ name: session.name, role: session.roleLabel, color: session.color }} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <BotWidget />
    </div>
  );
}
