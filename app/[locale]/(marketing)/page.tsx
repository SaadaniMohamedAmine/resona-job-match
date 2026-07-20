import Link from "next/link";
import { IconCircleCheck, IconGauge, IconSearch, IconWand, IconFileText } from "@tabler/icons-react";
import { AnimatedScoreRing } from "@/components/ui/animated-score-ring";
import { SkillTag } from "@/components/ui/skill-tag";
import { Reveal } from "@/components/ui/reveal";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";

const GLASS_CARD_STYLE = {
  backgroundColor: "rgba(42, 38, 32, 0.4)",
  backdropFilter: "blur(8px)",
};

const CARD_HOVER = "transition-colors hover:border-accent/40";

const PROCESS_STEPS = [
  {
    phase: "Phase 01",
    title: "Upload",
    description:
      "Drop your current CV in PDF or DOCX format. Our parser extracts structural data with 99.9% accuracy.",
    active: true,
  },
  {
    phase: "Phase 02",
    title: "Analyze",
    description:
      "Compare against millions of data points and industry-specific benchmarks to identify alignment gaps.",
    active: false,
  },
  {
    phase: "Phase 03",
    title: "Results",
    description:
      "Receive a comprehensive report and an optimized version of your profile ready for submission.",
    active: false,
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-1 flex-col pb-16 md:pb-0">
      {/* Hero */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(201,169,97,0.05) 0%, transparent 70%)",
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] animate-pulse rotate-45 border border-accent/20" />
          <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] -rotate-12 border border-accent/10" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-5 text-center md:px-16">
          <div
            className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-track px-3 py-1"
            style={{ animationDelay: "0ms" }}
          >
            <IconCircleCheck size={14} stroke={1.5} className="text-accent" />
            <span className="text-xs tracking-widest text-muted uppercase">Precise Minimalism</span>
          </div>

          <h1
            className="animate-fade-up mx-auto mb-6 max-w-3xl font-display text-4xl leading-tight font-bold text-base-light md:text-5xl"
            style={{ animationDelay: "100ms" }}
          >
            Your resume, aligned to every opportunity.
          </h1>

          <p
            className="animate-fade-up mx-auto mb-12 max-w-2xl text-lg text-muted"
            style={{ animationDelay: "200ms" }}
          >
            Most resumes are rejected by ATS before a human ever reads them. We ensure yours makes it
            through with technical precision and architectural clarity.
          </p>

          <div
            className="animate-fade-up flex flex-col items-center justify-center gap-4 md:flex-row"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/upload"
              className="w-full rounded-(--radius-control) bg-accent px-10 py-4 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 active:scale-95 md:w-auto"
            >
              Analyze your resume
            </Link>
            <Link
              href="/#process"
              className="w-full rounded-(--radius-control) border border-accent px-10 py-4 text-sm font-bold text-accent transition-all hover:bg-accent/5 active:scale-95 md:w-auto"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* Core Intelligence — Bento Grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-16">
          <Reveal className="mb-16">
            <h2 className="mb-4 font-display text-3xl font-bold text-base-light">Core Intelligence</h2>
            <div className="h-1 w-16 bg-accent" />
          </Reveal>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* AI Match Score */}
            <Reveal
              delay={0}
              className={`rounded-(--radius-card) border border-track p-10 md:col-span-8 ${CARD_HOVER}`}
              style={GLASS_CARD_STYLE}
            >
              <div className="flex flex-col items-center gap-12 md:flex-row">
                <div className="flex-1">
                  <IconGauge size={36} stroke={1.5} className="mb-6 text-accent" />
                  <h3 className="mb-4 font-display text-xl font-medium text-base-light">AI Match Score</h3>
                  <p className="text-muted">
                    Our proprietary algorithm simulates top-tier ATS logic, providing a definitive
                    alignment percentage against specific job descriptions.
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <AnimatedScoreRing score={85} size={120} />
                  <span className="mt-4 text-xs tracking-tighter text-muted uppercase">Current score</span>
                </div>
              </div>
            </Reveal>

            {/* Gap Detection */}
            <Reveal
              delay={80}
              className={`flex flex-col justify-between rounded-(--radius-card) border border-track p-10 md:col-span-4 ${CARD_HOVER}`}
              style={GLASS_CARD_STYLE}
            >
              <div>
                <IconSearch size={36} stroke={1.5} className="mb-6 text-accent" />
                <h3 className="mb-4 font-display text-xl font-medium text-base-light">Gap Detection</h3>
                <p className="text-sm text-muted">
                  Identifying missing critical technical keywords and experience markers that recruiters
                  look for first.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                <SkillTag label="Kubernetes" variant="gap" />
                <SkillTag label="CI/CD" variant="gap" />
              </div>
            </Reveal>

            {/* Section Rewriting */}
            <Reveal
              delay={160}
              className={`rounded-(--radius-card) border border-track p-10 md:col-span-4 ${CARD_HOVER}`}
              style={GLASS_CARD_STYLE}
            >
              <IconWand size={36} stroke={1.5} className="mb-6 text-accent" />
              <h3 className="mb-4 font-display text-xl font-medium text-base-light">Section Rewriting</h3>
              <p className="text-sm text-muted">
                Transforming passive descriptions into high-impact, data-driven achievements that resonate
                with decision makers.
              </p>
            </Reveal>

            {/* Cover Letter Generation */}
            <Reveal
              delay={240}
              className={`rounded-(--radius-card) border border-track p-10 md:col-span-8 ${CARD_HOVER}`}
              style={GLASS_CARD_STYLE}
            >
              <div className="flex flex-col gap-8 md:flex-row">
                <div className="flex-1">
                  <IconFileText size={36} stroke={1.5} className="mb-6 text-accent" />
                  <h3 className="mb-4 font-display text-xl font-medium text-base-light">
                    Cover Letter Generation
                  </h3>
                  <p className="text-muted">
                    Generate precisely tailored narratives that bridge the gap between your history and the
                    company&apos;s future.
                  </p>
                </div>
                <div className="flex-1 rounded-(--radius-control) border border-track bg-track p-4">
                  <div className="mb-2 h-2 w-full rounded bg-track" />
                  <div className="mb-4 h-2 w-3/4 rounded bg-track" />
                  <div className="space-y-2">
                    <div className="h-1 w-full rounded bg-accent/20" />
                    <div className="h-1 w-full rounded bg-accent/20" />
                    <div className="h-1 w-5/6 rounded bg-accent/20" />
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The Process */}
      <section id="process" className="py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-16">
          <Reveal className="mb-20 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-base-light">The Process</h2>
            <p className="text-muted">Technical alignment in three phases.</p>
          </Reveal>

          <div className="relative">
            <div className="absolute top-0 left-0 hidden h-px w-full bg-track md:block" />
            <div className="relative grid grid-cols-1 gap-16 md:grid-cols-3">
              {PROCESS_STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 120} className="relative pt-8">
                  <div
                    className={`absolute top-0 left-0 hidden h-[3px] w-full -translate-y-px md:block md:w-1/3 ${
                      step.active ? "bg-accent" : "bg-transparent"
                    }`}
                  />
                  <span className="mb-4 block text-xs tracking-widest text-accent uppercase">
                    {step.phase}
                  </span>
                  <h3 className="mb-4 font-display text-xl font-medium text-base-light">{step.title}</h3>
                  <p className="text-muted">{step.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative h-[60vh] overflow-hidden bg-track">
        <div className="absolute inset-0 flex items-center justify-center px-5">
          <Reveal
            className="max-w-2xl rounded-(--radius-card) p-12 text-center"
            style={GLASS_CARD_STYLE}
          >
            <h2 className="mb-6 font-display text-3xl font-bold text-base-light">
              Designed for Experts by Experts.
            </h2>
            <p className="mb-8 text-muted">
              Résona eliminates the guesswork of job hunting through factual data and architectural resume
              construction.
            </p>
            <Link
              href="/upload"
              className="inline-block rounded-(--radius-control) bg-accent px-8 py-4 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 active:scale-95"
            >
              Start Your Alignment
            </Link>
          </Reveal>
        </div>
      </section>

      <MobileBottomNav />
    </div>
  );
}
