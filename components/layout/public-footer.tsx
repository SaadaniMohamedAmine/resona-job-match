import Link from "next/link";
import { useTranslations } from "next-intl";
import { Wordmark } from "@/components/ui/wordmark";

export function PublicFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="relative z-10 mt-auto w-full border-t border-track py-12 print:hidden">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-16">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <Wordmark />
          <p className="text-xs text-muted">© 2026 Résona. {t("footerTagline")}</p>
        </div>
        <div className="flex gap-8 text-xs">
          <Link href="/demo" className="text-muted transition-colors hover:text-accent">
            {t("footerLiveDemo")}
          </Link>
          <Link href="/built-with" className="text-muted transition-colors hover:text-accent">
            {t("footerBuiltWith")}
          </Link>
          <Link href="/privacy" className="text-muted transition-colors hover:text-accent">
            {t("footerPrivacy")}
          </Link>
          <Link href="/terms" className="text-muted transition-colors hover:text-accent">
            {t("footerTerms")}
          </Link>
          <Link href="mailto:hello@resona.dev" className="text-muted transition-colors hover:text-accent">
            {t("footerContact")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
