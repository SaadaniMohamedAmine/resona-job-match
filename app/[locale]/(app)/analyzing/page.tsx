"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconCheck, IconLoader2, IconHourglassEmpty } from "@tabler/icons-react";
import { Stepper } from "@/components/ui/stepper";
import { AnalyzingRing } from "@/components/ui/analyzing-ring";

const STEPS = [
  "Extracting your resume",
  "Comparing with the job description",
  "Calculating your match score",
  "Preparing suggestions",
];

export default function AnalyzingPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState("");
  const hasRunRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1200);

    async function run() {
      // Guards against React Strict Mode's dev-only double-invocation of effects on
      // mount, which would otherwise fire this real POST (and burn rate-limit quota) twice.
      if (hasRunRef.current) return;
      hasRunRef.current = true;

      const body = Object.fromEntries(params.entries());
      if (!body.fileUrl || !body.jobTitle || !body.jobDescription) {
        setError("Missing required parameters");
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Analysis failed");
        }
        const data = await res.json();
        clearInterval(interval);
        router.replace(`/results/${data.analysisId}`);
      } catch (err) {
        clearInterval(interval);
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    }
    run();

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percent = Math.round(((activeStep + 1) / STEPS.length) * 100);

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={1} />
        <div className="mt-16">
          <p className="text-sm text-accent">{error}</p>
        </div>
        <button
          onClick={() => router.push("/upload")}
          className="mt-6 rounded-(--radius-control) border border-track px-6 py-3 text-sm text-base-light transition-colors hover:bg-track"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={1} />

      <div className="mt-16">
        <AnalyzingRing percent={percent} />
      </div>

      <div className="mt-10 mb-10">
        <h1 className="font-display text-2xl font-bold text-base-light md:text-3xl">
          Analyzing Profile
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted">
          Cross-referencing historical performance data with current industry benchmarks.
        </p>
      </div>

      <ul className="flex w-full max-w-sm flex-col gap-4">
        {STEPS.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li
              key={step}
              className={`flex items-center gap-4 rounded-(--radius-control) border p-4 text-left transition-all ${
                active
                  ? "border-accent bg-track/40"
                  : done
                    ? "border-track bg-track/20"
                    : "border-track/60 opacity-40"
              }`}
            >
              {done ? (
                <IconCheck size={20} stroke={1.5} className="shrink-0 text-accent" />
              ) : active ? (
                <IconLoader2 size={20} stroke={1.5} className="shrink-0 animate-spin text-accent" />
              ) : (
                <IconHourglassEmpty size={20} stroke={1.5} className="shrink-0 text-muted" />
              )}
              <span
                className={`text-sm ${active ? "font-medium text-base-light" : done ? "text-base-light" : "text-muted"}`}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
