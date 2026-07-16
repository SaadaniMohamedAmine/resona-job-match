"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Stepper } from "@/components/ui/stepper";
import { LoaderRing } from "@/components/ui/loader-ring";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const { startUpload } = useUploadThing("resumeUploader");

  async function handleAnalyze() {
    if (!file || !jobTitle || !jobDescription) return;
    setSubmitting(true);
    setError("");

    const uploaded = await startUpload([file]);
    const fileUrl = uploaded?.[0]?.url;
    if (!fileUrl) {
      setError("Upload failed. Please try again.");
      setSubmitting(false);
      return;
    }

    const params = new URLSearchParams({
      fileUrl,
      fileName: file.name,
      jobTitle,
      company,
      jobDescription,
    });
    router.push(`/analyzing?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Stepper steps={["Upload", "Analyze", "Results"]} currentStep={0} />

      <div className="mt-12 flex flex-col gap-6">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-[var(--color-track)] px-6 py-12 text-center text-sm text-[var(--color-muted)] transition-colors hover:border-[var(--color-accent)]">
          {file ? (
            <span className="text-[var(--color-base-light)]">{file.name}</span>
          ) : (
            <span>Drop your resume here or click to browse</span>
          )}
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <input
          placeholder="Job title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)] placeholder:text-[var(--color-muted)]"
        />
        <input
          placeholder="Company (optional)"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)] placeholder:text-[var(--color-muted)]"
        />
        <textarea
          placeholder="Paste the job description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
          className="rounded-[var(--radius-control)] border border-[var(--color-track)] bg-transparent px-4 py-2.5 text-sm text-[var(--color-base-light)] placeholder:text-[var(--color-muted)]"
        />

        {error && <p className="text-sm text-[var(--color-accent)]">{error}</p>}

        <button
          disabled={!file || !jobTitle || !jobDescription || submitting}
          onClick={handleAnalyze}
          className="flex items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] py-3 text-sm font-medium text-[var(--color-base)] transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? <LoaderRing size={16} /> : "Analyze"}
        </button>
      </div>
    </div>
  );
}
