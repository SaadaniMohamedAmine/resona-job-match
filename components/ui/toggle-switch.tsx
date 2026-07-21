export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-10 shrink-0 rounded-full border transition-colors ${
        checked ? "border-accent bg-accent" : "border-track bg-track"
      }`}
    >
      <span
        className={`absolute top-0.5 size-4 rounded-full bg-base transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
