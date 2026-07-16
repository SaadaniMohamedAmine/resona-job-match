export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <ol className="flex items-center gap-4">
      {steps.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
              i <= currentStep ? "bg-[var(--color-accent)] text-[var(--color-base)]" : "border border-[var(--color-track)] text-[var(--color-muted)]"
            }`}
          >
            {i + 1}
          </span>
          <span className={i === currentStep ? "text-[var(--color-base-light)]" : "text-[var(--color-muted)]"}>
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
