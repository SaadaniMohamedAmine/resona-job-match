"use client";

import { useState } from "react";
import { LoaderRing } from "@/components/ui/loader-ring";

export function CoverLetterModal({ analysisId, onClose }: { analysisId: string; onClose: () => void }) {
  const [letter, setLetter] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useState(() => {
    fetch("/api/cover-letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLetter(data.coverLetter || data.error || "");
        setLoading(false);
      });
  });

  async function handleCopy() {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-xl rounded-[var(--radius-card)] border border-[var(--color-track)] bg-[var(--color-base)] p-8">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg text-[var(--color-base-light)]">
          Cover letter
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoaderRing size={32} />
          </div>
        ) : (
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            rows={16}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-[var(--color-base-light)]"
            placeholder="Generating…"
          />
        )}
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={handleCopy}
            disabled={loading || !letter}
            className="rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-2 text-sm text-[var(--color-base-light)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {copied ? "Copied!" : "Copy to clipboard"}
          </button>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-control)] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-base-light)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
