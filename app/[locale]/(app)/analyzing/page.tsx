"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stepper } from "@/components/ui/stepper";
import { LoaderRing } from "@/components/ui/loader-ring";

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 1200);

    async function run() {
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

  if (error) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={1} />
        <div className="mt-16">
          <p className="text-sm text-[var(--color-accent)]">{error}</p>
        </div>
        <button
          onClick={() => router.push("/upload")}
          className="mt-6 rounded-[var(--radius-control)] border border-[var(--color-track)] px-6 py-3 text-sm text-[var(--color-base-light)]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={1} />
      <div className="mt-16">
        <LoaderRing size={64} />
      </div>
      <ul className="mt-10 flex flex-col gap-3 text-left">
        {STEPS.map((step, i) => (
          <li
            key={step}
            className={`text-sm ${
              i <= activeStep ? "text-[var(--color-base-light)]" : "text-[var(--color-muted)]"
            }`}
          >
            {i < activeStep ? "✓ " : ""}
            {step}
          </li>
        ))}
      </ul>
    </div>
  );
}
