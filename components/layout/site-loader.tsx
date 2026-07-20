"use client";

import { useEffect, useState } from "react";

const MIN_VISIBLE_MS = 900;
const FADE_MS = 400;

export function SiteLoader() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const tick = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + (90 - p) * 0.15));
    }, 100);

    const minDelay = new Promise<void>((resolve) => setTimeout(resolve, MIN_VISIBLE_MS));
    const pageReady =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));

    Promise.all([minDelay, pageReady]).then(() => {
      clearInterval(tick);
      setProgress(100);
      setTimeout(() => setVisible(false), 200);
    });

    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (visible) return;
    const timeout = setTimeout(() => setMounted(false), FADE_MS);
    return () => clearTimeout(timeout);
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-base transition-opacity ease-out ${
        visible ? "opacity-100 duration-0" : "pointer-events-none opacity-0 duration-400"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute size-40 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex size-20 animate-pulse items-center justify-center rounded-(--radius-card) border-2 border-accent bg-track/20">
          <span className="font-display text-3xl font-bold text-accent">RE</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="font-display text-xl font-bold text-base-light">Résona</span>
        <span className="text-xs tracking-[0.2em] text-muted uppercase">
          Precise Minimalism in Career Analytics
        </span>
      </div>

      <div className="mt-2 w-56">
        <div className="h-1 w-full overflow-hidden rounded-full bg-track">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] tracking-widest text-muted uppercase">
          <span>Loading</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
