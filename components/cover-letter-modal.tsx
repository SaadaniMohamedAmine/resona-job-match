"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconFileText, IconX, IconCopy, IconPrinter } from "@tabler/icons-react";
import { LoaderRing } from "@/components/ui/loader-ring";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";

export function CoverLetterModal({
  analysisId,
  jobTitle,
  company,
}: {
  analysisId: string;
  jobTitle: string;
  company: string | null;
}) {
  const t = useTranslations("coverLetter");
  const tNotify = useTranslations("notifications");
  const router = useRouter();
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [proRequired, setProRequired] = useState(false);
  const [error, setError] = useState("");
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.status === 403) {
          setProRequired(true);
        } else if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : tNotify("generic"));
        } else {
          setLetter(data.coverLetter);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(tNotify("generic"));
        setLoading(false);
      });
  }, [analysisId, tNotify]);

  function handleClose() {
    router.back();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4 print:static print:bg-white print:p-0"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-(--radius-card) border border-track bg-base shadow-2xl print:max-h-none print:w-auto print:max-w-none print:border-0 print:shadow-none"
      >
        <header className="flex items-center justify-between border-b border-track px-8 py-6 print:hidden">
          <div className="flex items-center gap-3">
            <IconFileText size={20} stroke={1.5} className="text-accent" />
            <h2 className="font-display text-lg font-medium text-base-light">{t("title")}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t("close")}
            className="rounded-full p-2 text-muted transition-colors hover:bg-track hover:text-base-light"
          >
            <IconX size={20} stroke={1.5} />
          </button>
        </header>

        <div
          className="flex-1 overflow-y-auto p-8 md:p-12 print:overflow-visible print:p-12"
          style={{
            backgroundImage: "radial-gradient(var(--color-track) 0.5px, transparent 0.5px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div
            id="cover-letter-print"
            className="mx-auto min-h-125 max-w-2xl border border-track bg-track/10 p-10 print:min-h-0 print:border-0 print:bg-white print:p-0 print:text-black"
          >
            <div className="mb-8 space-y-1">
              <p className="text-xs tracking-widest text-muted uppercase print:text-black/60">
                {t("to")}
              </p>
              <p className="font-medium text-accent print:text-black">{t("hiringCommittee")}</p>
              <p className="text-sm text-muted print:text-black/70">
                {t("roleFor", { jobTitle: company ? `${jobTitle} — ${company}` : jobTitle })}
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <LoaderRing size={32} />
              </div>
            ) : proRequired ? (
              <UpgradePrompt feature={t("featureName")} />
            ) : error ? (
              <p className="py-16 text-center text-sm text-accent">{error}</p>
            ) : (
              <textarea
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
                rows={18}
                spellCheck={false}
                className="w-full resize-none bg-transparent text-sm leading-relaxed text-base-light focus:outline-none print:text-black"
              />
            )}
          </div>
        </div>

        {!loading && !proRequired && !error && (
          <footer className="flex flex-col items-center justify-between gap-6 border-t border-track bg-base px-8 py-6 md:flex-row print:hidden">
            <div className="flex items-center gap-3">
              <span className="size-2 animate-pulse rounded-full bg-accent" />
              <span className="text-xs tracking-widest text-muted uppercase">{t("aiOptimized")}</span>
            </div>
            <div className="flex w-full flex-wrap items-center gap-4 md:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="flex flex-1 items-center justify-center gap-2 rounded-(--radius-control) border border-accent px-6 py-3 text-xs font-medium tracking-widest text-accent uppercase transition-colors hover:bg-accent/10 md:flex-none"
              >
                <IconCopy size={16} stroke={1.5} />
                {copied ? t("copiedCta") : t("copy")}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex flex-1 items-center justify-center gap-2 rounded-(--radius-control) bg-accent px-8 py-3 text-xs font-bold tracking-widest text-[var(--color-base)] uppercase transition-opacity hover:opacity-90 md:flex-none"
              >
                <IconPrinter size={16} stroke={1.5} />
                {t("exportPdf")}
              </button>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
