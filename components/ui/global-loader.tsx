import { useTranslations } from "next-intl";

export function GlobalLoader() {
  const t = useTranslations("nav");

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center">
      <div className="square-loader mb-8" role="status" aria-label={t("loaderProgress")}>
        <div className="sq-1" />
        <div className="sq-2" />
        <div className="sq-3" />
        <div className="sq-4" />
        <div className="sq-5" />
      </div>
      <span className="font-display text-lg font-bold tracking-tight text-accent">Résona</span>
      <span className="mt-4 text-xs tracking-widest text-muted uppercase opacity-50">
        {t("calibratingInsights")}
      </span>
    </div>
  );
}
