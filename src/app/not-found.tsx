import Link from "next/link";
import { Logo } from "@/components/shared/brand";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-background p-6 text-center">
      <div>
        <div className="mx-auto mb-4 w-fit"><Logo size={40} /></div>
        <h1 className="text-3xl font-extrabold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">The page you’re looking for doesn’t exist.</p>
        <Link href="/home" className="grad-brand mt-6 inline-block rounded-xl px-5 py-2.5 font-semibold text-white">Back to Home</Link>
      </div>
    </div>
  );
}
