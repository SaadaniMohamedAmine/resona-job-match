"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconInfoCircle } from "@tabler/icons-react";

export function SemanticSimilarityBar({ similarity }: { similarity: number | null }) {
  const t = useTranslations("results");
  const [showInfo, setShowInfo] = useState(false);
  if (similarity === null) return null;
  const pct = Math.round(similarity * 100);

  return (
    <div className="mt-6 w-full max-w-xs">
      <div className="mb-2 flex items-center justify-center gap-1.5 text-xs tracking-widest text-muted uppercase">
        <span>{t("semanticSimilarityLabel")}</span>
        <button
          type="button"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
          onClick={() => setShowInfo((v) => !v)}
          className="relative text-muted hover:text-accent"
          aria-label={t("semanticSimilarityAria")}
        >
          <IconInfoCircle size={13} stroke={1.5} />
          {showInfo && (
            <span className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-(--radius-control) border border-track bg-base p-3 text-left text-[11px] leading-relaxed normal-case text-muted shadow-lg">
              {t("semanticSimilarityTooltip")}
            </span>
          )}
        </button>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-center text-xs text-muted">{pct}%</p>
    </div>
  );
}
