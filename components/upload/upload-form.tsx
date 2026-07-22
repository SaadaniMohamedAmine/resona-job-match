"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { IconUpload, IconLock } from "@tabler/icons-react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { LoaderRing } from "@/components/ui/loader-ring";
import { UpgradePrompt } from "@/components/billing/upgrade-prompt";
import { notify } from "@/lib/toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MIN_WORD_COUNT = 20;

export function UploadForm({ quotaExceeded }: { quotaExceeded: boolean }) {
  const t = useTranslations("upload");
  const tNotify = useTranslations("notifications");
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { startUpload } = useUploadThing("resumeUploader");

  const wordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;
  const canAnalyze = !!file && !!jobTitle && wordCount > MIN_WORD_COUNT && !quotaExceeded;

  function pickFile(candidate: File | null | undefined) {
    if (!candidate) return;
    if (candidate.type !== "application/pdf") {
      notify.error(tNotify("wrongFileType"));
      return;
    }
    if (candidate.size > MAX_FILE_SIZE) {
      notify.error(tNotify("fileTooLarge"));
      return;
    }
    setFile(candidate);
  }

  async function handleAnalyze() {
    if (!canAnalyze || !file) return;
    setSubmitting(true);

    const uploaded = await startUpload([file]);
    const fileUrl = uploaded?.[0]?.url;
    if (!fileUrl) {
      notify.error(t("uploadFailed"));
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

  if (quotaExceeded) {
    return <UpgradePrompt feature={t("unlimitedAnalysesFeature")} description={t("quotaExceededBody")} />;
  }

  return (
    <div className="flex flex-col gap-8">
      <label
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          pickFile(e.dataTransfer.files?.[0]);
        }}
        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-(--radius-card) border border-dashed px-6 py-12 text-center transition-colors ${
          dragActive || file
            ? "border-accent bg-track/30"
            : "border-track bg-track/10 hover:bg-track/20"
        }`}
      >
        <div className="mb-4 flex size-16 items-center justify-center rounded-full border border-track bg-track/40 transition-colors group-hover:border-accent">
          <IconUpload size={28} stroke={1.5} className="text-accent" />
        </div>
        <h3 className="mb-2 font-display text-lg font-medium text-base-light">
          {file ? file.name : t("dropzoneLabel")}
        </h3>
        <p className="text-sm text-muted">{file ? t("dropzoneReady") : t("dropzoneHint")}</p>
        <input
          type="file"
          accept="application/pdf"
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => pickFile(e.target.files?.[0])}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          placeholder={t("jobTitleLabel")}
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <input
          placeholder={t("companyLabel")}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-(--radius-control) border border-track bg-transparent px-4 py-2.5 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs tracking-widest text-muted uppercase">
          {t("targetJdLabel")}
        </label>
        <div className="relative">
          <textarea
            placeholder={t("jdLabel")}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-(--radius-card) border border-track bg-transparent p-6 text-sm text-base-light placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <span className="absolute right-4 bottom-4 text-xs text-muted">
            {wordCount} {t("wordsSuffix")}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2 text-muted">
          <IconLock size={16} stroke={1.5} />
          <span className="text-sm">{t("encryptedNotice")}</span>
        </div>
        <button
          disabled={!canAnalyze || submitting}
          onClick={handleAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-(--radius-control) bg-accent px-12 py-4 text-sm font-bold text-[var(--color-base)] transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30 md:w-auto"
        >
          {submitting ? <LoaderRing size={16} /> : t("analyzeResumeCta")}
        </button>
      </div>
    </div>
  );
}
