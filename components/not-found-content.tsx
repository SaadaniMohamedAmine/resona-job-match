"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { IconAlertCircle } from "@tabler/icons-react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export function NotFoundContent({
  isAuthenticated,
  errorCodeLabel = "Error code 404",
  title = "Path unresolved",
  body = "Page not found. This path does not exist in our system.",
  backToDashboardLabel = "Back to dashboard",
  backToHomeLabel = "Back to home",
  systemHistoryLabel = "System history",
}: {
  isAuthenticated: boolean;
  errorCodeLabel?: string;
  title?: string;
  body?: string;
  backToDashboardLabel?: string;
  backToHomeLabel?: string;
  systemHistoryLabel?: string;
}) {
  const glowRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function handleMouseMove(e: MouseEvent) {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
      if (gridRef.current) {
        const moveX = (e.clientX - window.innerWidth / 2) / 50;
        const moveY = (e.clientY - window.innerHeight / 2) / 50;
        gridRef.current.style.transform = `translate(${moveX}px, ${moveY}px)`;
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Atmospheric background */}
      <div
        ref={gridRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle, var(--color-track) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed h-75 w-75 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(201,169,97,0.05) 0%, transparent 70%)" }}
      />

      <PublicNavbar />

      {/* Main */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20"
        >
          <div className="h-[80vh] w-px bg-linear-to-b from-transparent via-track to-transparent" />
        </div>

        <div className="max-w-2xl">
          <div className="mb-8 flex items-center justify-center gap-2 text-accent">
            <IconAlertCircle size={14} stroke={1.5} />
            <span className="font-body text-xs uppercase tracking-[0.2em]">{errorCodeLabel}</span>
          </div>

          <h1 className="font-display text-4xl font-bold tracking-tight text-base-light md:text-5xl">
            {title}
          </h1>

          <p className="mx-auto mt-4 mb-12 max-w-md text-muted">
            {body}
          </p>

          <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
            <Link
              href={isAuthenticated ? "/dashboard" : "/"}
              className="rounded-(--radius-control) bg-accent px-8 py-4 font-body text-xs font-medium uppercase tracking-widest text-[var(--color-base)] transition-opacity hover:opacity-90"
            >
              {isAuthenticated ? backToDashboardLabel : backToHomeLabel}
            </Link>
            <Link
              href="/resumes"
              className="rounded-(--radius-control) border border-track px-8 py-4 font-body text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent hover:text-accent"
            >
              {systemHistoryLabel}
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
