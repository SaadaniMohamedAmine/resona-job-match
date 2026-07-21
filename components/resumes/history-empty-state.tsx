import Link from "next/link";
import { IconUpload, IconShieldCheck, IconChartDots, IconBrain } from "@tabler/icons-react";
import { SectionNavLink } from "@/components/layout/section-nav-link";

export function HistoryEmptyState() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-5 py-24 text-center">
      {/* Illustration */}
      <div className="group relative mb-8">
        <div className="absolute inset-0 scale-150 rounded-full bg-accent/5 blur-xl transition-transform duration-700 group-hover:scale-175" />
        <svg
          className="relative overflow-visible"
          width="240"
          height="240"
          viewBox="0 0 240 240"
          fill="none"
          aria-hidden="true"
        >
          <rect x="70" y="50" width="100" height="140" rx="2" stroke="var(--color-muted)"
            opacity="0.5" strokeWidth="1" />
          <path d="M70 70H170" stroke="#342F24" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M70 120H170" stroke="#342F24" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M70 170H170" stroke="#342F24" strokeWidth="0.5" strokeDasharray="4 4" />

          <circle
            className="animate-orbit-spin"
            cx="120"
            cy="120"
            r="40"
            stroke="var(--color-accent)"
            strokeWidth="1.5"
          />
          <circle cx="120" cy="120" r="3" fill="var(--color-accent)" />

          <rect className="animate-scan-sweep" x="65" y="50" width="110" height="1" fill="var(--color-accent)" />

          <rect
            x="50"
            y="190"
            width="12"
            height="12"
            stroke="var(--color-muted)"
            opacity="0.5"
            strokeWidth="1"
            transform="rotate(45 56 196)"
          />
          <rect
            x="180"
            y="40"
            width="8"
            height="8"
            stroke="var(--color-muted)"
            opacity="0.5"
            strokeWidth="1"
            transform="rotate(15 184 44)"
          />
        </svg>
      </div>

      {/* Content */}
      <h1 className="font-display text-2xl font-bold tracking-tight text-base-light">
        Nothing analyzed yet
      </h1>
      <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
        Upload your first resume to begin the <span className="text-accent">precision alignment
        process</span>. Our expert-level analysis engine is ready to evaluate your career trajectory.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/upload"
          className="flex items-center gap-3 rounded-(--radius-control) bg-accent px-8 py-4 text-sm font-medium tracking-wide text-[var(--color-base)] transition-all hover:opacity-90 active:scale-95"
        >
          <IconUpload size={20} stroke={1.5} />
          Upload your first resume
        </Link>
        <SectionNavLink
          sectionId="features"
          className="rounded-(--radius-control) border border-track px-8 py-4 text-sm tracking-wide text-muted transition-all hover:bg-track"
        >
          View Sample Report
        </SectionNavLink>
      </div>

      {/* Supporting status row */}
      <div className="mt-12 flex items-center gap-6 text-muted/40">
        <div className="flex items-center gap-2">
          <IconShieldCheck size={16} stroke={1.5} />
          <span className="text-[10px] tracking-[0.2em] uppercase">ATS Optimization</span>
        </div>
        <div className="size-1 rounded-full bg-track" />
        <div className="flex items-center gap-2">
          <IconChartDots size={16} stroke={1.5} />
          <span className="text-[10px] tracking-[0.2em] uppercase">Gap Analysis</span>
        </div>
        <div className="size-1 rounded-full bg-track" />
        <div className="flex items-center gap-2">
          <IconBrain size={16} stroke={1.5} />
          <span className="text-[10px] tracking-[0.2em] uppercase">Expert Alignment</span>
        </div>
      </div>
    </div>
  );
}
