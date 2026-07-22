import Link from "next/link";
import { getTranslations } from "next-intl/server";

const SECTION_KEYS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const RICH_TAGS = {
  p: (chunks: React.ReactNode) => <p className="mt-3 first:mt-0">{chunks}</p>,
  link: (chunks: React.ReactNode) => (
    <Link href="/privacy" className="text-accent hover:underline">
      {chunks}
    </Link>
  ),
};

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 md:px-16">
      <h1 className="font-display text-2xl font-bold text-base-light">{t("termsTitle")}</h1>
      <p className="mt-2 text-xs tracking-widest text-muted uppercase">
        {t("lastUpdated", { date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date("2026-07-20")) })}
      </p>

      <p className="mt-8 text-sm leading-relaxed text-muted">
        {t.rich("termsIntro", RICH_TAGS)}
      </p>

      {SECTION_KEYS.map((n) => (
        <section key={n} className="mt-10">
          <h2 className="mb-3 font-display text-lg font-medium text-base-light">
            {t(`termsSection${n}Title`)}
          </h2>
          <div className="text-sm leading-relaxed text-muted">
            {t.rich(`termsSection${n}Body`, RICH_TAGS)}
          </div>
        </section>
      ))}

      <p className="mt-10 text-sm text-muted">
        {t("termsContactLabel")}{" "}
        <a href="mailto:hello@resona.dev" className="text-accent hover:underline">
          hello@resona.dev
        </a>
      </p>
    </div>
  );
}
