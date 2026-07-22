"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function TrackerEmptyState({ onAdd }: { onAdd: () => void }) {
  const t = useTranslations("tracker");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({ x: -y * 0.05, y: x * 0.05 });
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="mb-12 flex justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.2s ease-out",
        }}
      >
        <svg
          className="animate-hex-float opacity-80"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="animate-hex-draw"
            d="M60 10 L103.3 35 L103.3 85 L60 110 L16.7 85 L16.7 35 Z"
            stroke="var(--color-muted)"
          />
          <path
            className="animate-hex-draw"
            d="M60 10 L60 110"
            stroke="var(--color-muted)"
            style={{ animationDelay: "0.5s" }}
          />
          <path
            className="animate-hex-draw"
            d="M16.7 35 L103.3 85"
            stroke="var(--color-muted)"
            style={{ animationDelay: "0.8s" }}
          />
          <path
            className="animate-hex-draw"
            d="M103.3 35 L16.7 85"
            stroke="var(--color-muted)"
            style={{ animationDelay: "1.1s" }}
          />
          <circle className="animate-pulse" cx="60" cy="60" r="4" fill="var(--color-accent)" />
        </svg>
      </div>

      <h1 className="font-display text-2xl font-bold text-base-light">{t("emptyTitle")}</h1>
      <p className="mx-auto mt-4 max-w-sm leading-relaxed text-muted">{t("emptyBody")}</p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-8 rounded-(--radius-control) border border-accent bg-accent px-12 py-4 text-xs font-medium tracking-widest text-[var(--color-base)] uppercase transition-all hover:bg-transparent hover:text-accent"
      >
        {t("emptyCta")}
      </button>
    </div>
  );
}
