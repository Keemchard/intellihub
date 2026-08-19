"use client";
import Link from "next/link";
import { Logo } from "@/components/shared/brand";
import { Icon } from "@/components/shared/icon";

export default function Landing() {
  const points = [
    {
      icon: "grid",
      title: "Discover",
      desc: "One marketplace for trusted analytics across the NAI ecosystem.",
    },
    {
      icon: "badge-check",
      title: "Trust",
      desc: "Certification, ownership and data-quality signals on every asset.",
    },
    {
      icon: "external-link",
      title: "Consume",
      desc: "Launch the dashboard or data product the moment access is granted.",
    },
  ];
  return (
    <main className="min-h-screen bg-sidebar text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2.5">
          <Logo size={32} />
          <span className="text-lg font-extrabold">IntelliHub</span>
        </div>
        <Link
          href="/login"
          className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/20"
        >
          Sign in
        </Link>
      </header>
      <section className="mx-auto max-w-3xl px-6 pb-24 pt-20 text-center">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white/70">
          Network Analytics &amp; Insights
        </span>
        <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl">
          The front door to{" "}
          <span className="text-grad-brand">trusted analytics</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
          Discover, understand, trust, and access analytics across NAI — without
          hunting across platforms or relying on tribal knowledge.
        </p>
        <Link
          href="/login"
          className="grad-brand mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition hover:brightness-110"
        >
          Enter IntelliHub <Icon name="arrow-right" size={18} />
        </Link>
        <div className="mt-20 grid gap-5 text-left sm:grid-cols-3">
          {points.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10"
            >
              <div className="grad-brand mb-3 grid h-11 w-11 place-items-center rounded-xl">
                <Icon name={p.icon} size={20} />
              </div>
              <h3 className="font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-white/60">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
