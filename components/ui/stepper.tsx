export function Stepper({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <ol className="flex w-full gap-4 md:gap-6">
      {steps.map((step, i) => (
        <li key={step} className="flex-1">
          <div
            className={`mb-3 w-full rounded-full transition-colors ${
              i === currentStep ? "h-0.75 bg-accent" : i < currentStep ? "h-px bg-accent" : "h-px bg-track"
            }`}
          />
          <span
            className={`text-xs tracking-widest uppercase ${
              i === currentStep ? "font-bold text-accent" : "text-muted"
            }`}
          >
            {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
