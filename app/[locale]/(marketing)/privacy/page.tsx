import { getTranslations } from "next-intl/server";

const SECTION_KEYS = [1, 2, 3, 4, 5, 6, 7] as const;

const RICH_TAGS = {
  p: (chunks: React.ReactNode) => <p className="mt-3 first:mt-0">{chunks}</p>,
  ul: (chunks: React.ReactNode) => <ul className="mt-3 list-disc space-y-1 pl-5">{chunks}</ul>,
  li: (chunks: React.ReactNode) => <li>{chunks}</li>,
  b: (chunks: React.ReactNode) => <span className="text-base-light">{chunks}</span>,
};

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("legal");

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 md:px-16">
      <h1 className="font-display text-2xl font-bold text-base-light">{t("privacyTitle")}</h1>
      <p className="mt-2 text-xs tracking-widest text-muted uppercase">
        {t("lastUpdated", { date: new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(new Date("2026-07-20")) })}
      </p>

      <p className="mt-8 text-sm leading-relaxed text-muted">{t("privacyIntro")}</p>

      {SECTION_KEYS.map((n) => (
        <section key={n} className="mt-10">
          <h2 className="mb-3 font-display text-lg font-medium text-base-light">
            {t(`privacySection${n}Title`)}
          </h2>
          <div className="text-sm leading-relaxed text-muted">
            {t.rich(`privacySection${n}Body`, RICH_TAGS)}
          </div>
        </section>
      ))}

      <p className="mt-10 text-sm text-muted">
        {t("privacyContactLabel")}{" "}
        <a href="mailto:hello@resona.dev" className="text-accent hover:underline">
          hello@resona.dev
        </a>
      </p>
    </div>
  );
}
