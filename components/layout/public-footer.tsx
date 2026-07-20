import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative z-10 mt-auto w-full border-t border-track">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 md:flex-row md:px-16">
        <p className="text-xs text-muted">© 2026 Résona. All rights reserved.</p>
        <div className="flex gap-8">
          <Link href="/privacy" className="text-xs text-muted transition-colors hover:text-accent">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-muted transition-colors hover:text-accent">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
