import { cn } from "@/lib/utils";

export function Logo({ size = 30 }: { size?: number }) {
  return (
    <div className="grad-brand grid place-items-center rounded-xl text-white" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none" stroke="currentColor" strokeWidth={2.2}>
        <circle cx="12" cy="12" r="3" /><circle cx="12" cy="4" r="1.4" /><circle cx="20" cy="12" r="1.4" />
        <circle cx="12" cy="20" r="1.4" /><circle cx="4" cy="12" r="1.4" />
      </svg>
    </div>
  );
}

export function Avatar({ name, color, size = 36 }: { name: string; color: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <div className="grid shrink-0 place-items-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}
