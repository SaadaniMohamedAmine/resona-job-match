import Link from "next/link";
import { Wordmark } from "@/components/ui/wordmark";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <Wordmark />
      <p className="text-sm text-[var(--color-muted)]">This page doesn&apos;t exist.</p>
      <Link href="/dashboard" className="text-sm text-[var(--color-accent)] hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
