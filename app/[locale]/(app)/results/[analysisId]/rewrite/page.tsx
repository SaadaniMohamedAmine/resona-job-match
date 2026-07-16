"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { LoaderRing } from "@/components/ui/loader-ring";

const SECTIONS = ["summary", "experience", "skills"] as const;
type Section = (typeof SECTIONS)[number];

export default function RewritePage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [activeSection, setActiveSection] = useState<Section>("summary");
  const [original, setOriginal] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!original.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId, section: activeSection, originalText: original }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Rewrite failed");
      }
      const data = await res.json();
      setRewritten(data.rewritten);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-8 flex gap-2">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => {
              setActiveSection(section);
              setRewritten("");
              setError("");
            }}
            className={`rounded-[var(--radius-control)] px-4 py-2 text-sm capitalize transition-colors ${
              activeSection === section
                ? "bg-[var(--color-accent)] text-[var(--color-base)]"
                : "border border-[var(--color-track)] text-[var(--color-muted)] hover:text-[var(--color-base-light)]"
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm text-[var(--color-muted)]">Original</h3>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={12}
            className="w-full rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-3 text-sm text-[var(--color-base-light)] placeholder:text-[var(--color-muted)]"
            placeholder="Paste the section text you want to rewrite..."
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm text-[var(--color-accent)]">Rewritten</h3>
          <div className="min-h-[312px] rounded-[var(--radius-control)] border border-[var(--color-track)] px-4 py-3 text-sm text-[var(--color-base-light)]">
            {loading ? (
              <div className="flex justify-center pt-12">
                <LoaderRing size={24} />
              </div>
            ) : rewritten ? (
              rewritten
            ) : (
              <span className="text-[var(--color-muted)]">—</span>
            )}
          </div>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-[var(--color-accent)]">{error}</p>}

      <button
        onClick={handleGenerate}
        disabled={!original.trim() || loading}
        className="mt-6 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {loading ? "Rewriting…" : "Apply this rewrite"}
      </button>
    </div>
  );
}
