"use client";
import { useBotConversation, SUGGESTIONS } from "@/features/intellibot/use-bot";
import { Conversation } from "@/features/intellibot/conversation";
import { Composer, Suggestions } from "@/features/intellibot/composer";
import { Icon } from "@/components/shared/icon";

export default function IntelliBotPage() {
  const { turns, ask, isPending } = useBotConversation();
  return (
    <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-3xl flex-col px-6 py-8">
      {turns.length === 0 ? (
        <div className="grid flex-1 place-items-center text-center">
          <div className="w-full">
            <div className="grad-brand mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl text-white"><Icon name="sparkles" size={30} /></div>
            <h1 className="text-2xl font-extrabold tracking-tight">How can I help?</h1>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              I can find dashboards and data products, explain KPIs, and guide you through requesting access.
            </p>
            <div className="mx-auto mt-6 max-w-xl"><Composer onAsk={ask} disabled={isPending} autoFocus /></div>
            <div className="mt-4 flex justify-center"><Suggestions items={SUGGESTIONS} onPick={ask} /></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 pb-4"><Conversation turns={turns} isPending={isPending} /></div>
          <div className="sticky bottom-4"><Composer onAsk={ask} disabled={isPending} /></div>
        </>
      )}
    </div>
  );
}
