"use client";

import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { Select } from "@/components/ui/select";

type AnalysisOption = { id: string; jobTitle: string; matchScore: number };

export function AddApplicationModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { company: string; role: string; analysisId?: string }) => Promise<void>;
}) {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [analysisId, setAnalysisId] = useState("");
  const [analyses, setAnalyses] = useState<AnalysisOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetch("/api/resumes")
      .then((res) => res.json())
      .then((data) =>
        setAnalyses(
          (data.analyses ?? []).map(
            (a: { id: string; matchScore: number; jobPost: { title: string } }) => ({
              id: a.id,
              jobTitle: a.jobPost.title,
              matchScore: a.matchScore,
            })
          )
        )
      );
  }, [open]);

  if (!open) return null;

  function handleClose() {
    setCompany("");
    setRole("");
    setAnalysisId("");
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit({ company, role, analysisId: analysisId || undefined });
    setSubmitting(false);
    handleClose();
  }

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-(--radius-card) border border-track bg-base p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-lg font-medium text-base-light">Add application</h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition-colors hover:bg-track hover:text-base-light"
          >
            <IconX size={18} stroke={1.5} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            placeholder="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
            className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <input
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {analyses.length > 0 && (
            <Select
              value={analysisId}
              onChange={setAnalysisId}
              placeholder="Not linked to an analysis"
              options={[
                { value: "", label: "Not linked to an analysis" },
                ...analyses.map((a) => ({
                  value: a.id,
                  label: `${a.jobTitle} — ${a.matchScore}%`,
                })),
              ]}
            />
          )}
          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-(--radius-control) border border-track px-4 py-2 text-sm text-base-light transition-colors hover:bg-track"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-(--radius-control) bg-accent px-6 py-2.5 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {submitting ? "Adding…" : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
