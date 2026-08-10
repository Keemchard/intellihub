import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "./providers";
import "./globals.css";

const jakarta = localFont({
  src: [
    { path: "../fonts/jakarta-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/jakarta-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/jakarta-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/jakarta-700.woff2", weight: "700", style: "normal" },
    { path: "../fonts/jakarta-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IntelliHub — The Front Door to Network Analytics & Insights",
  description: "Discover, understand, trust, and access trusted analytics across NAI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={jakarta.variable}>
      <body className="font-sans"><Providers>{children}</Providers></body>
    </html>
  );
}
