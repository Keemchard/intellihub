"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/icon";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = theme === "dark";
  return (
    <button onClick={() => setTheme(dark ? "light" : "dark")} aria-label="Toggle theme"
      className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground ring-focus">
      {mounted ? <Icon name={dark ? "sun" : "moon"} size={19} /> : <span className="inline-block h-[19px] w-[19px]" />}
    </button>
  );
}
