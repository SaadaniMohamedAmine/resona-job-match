"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";

export type SelectOption = { value: string; label: string };

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-left text-sm transition-colors hover:border-accent/50 focus:border-accent focus:outline-none"
      >
        <span className={`truncate ${selected ? "text-base-light" : "text-muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <IconChevronDown
          size={16}
          stroke={1.5}
          className={`ml-2 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-(--radius-control) border border-track bg-base py-1 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm text-base-light transition-colors hover:bg-track"
            >
              <span className="truncate">{option.label}</span>
              {option.value === value && (
                <IconCheck size={14} stroke={1.5} className="shrink-0 text-accent" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
