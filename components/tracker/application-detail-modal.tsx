"use client";

import Link from "next/link";
import { IconX, IconBolt } from "@tabler/icons-react";
import type { Application, ApplicationStatus } from "@/lib/hooks/use-applications";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ApplicationDetailModal({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-md rounded-(--radius-card) border border-track bg-base p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate font-display text-lg font-medium text-base-light">
              {application.company}
            </h2>
            <p className="truncate text-sm text-muted">{application.role}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-track hover:text-base-light"
          >
            <IconX size={18} stroke={1.5} />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between border-b border-track pb-3">
            <span className="text-muted">Status</span>
            <span className="font-medium text-base-light">{STATUS_LABELS[application.status]}</span>
          </div>
          <div className="flex items-center justify-between border-b border-track pb-3">
            <span className="text-muted">Applied on</span>
            <span className="text-base-light">
              {new Date(application.appliedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          {application.interviewAt && (
            <div className="flex items-center justify-between border-b border-track pb-3">
              <span className="text-muted">Interview</span>
              <span className="text-base-light">{formatDateTime(application.interviewAt)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted">Linked analysis</span>
            {application.analysis ? (
              <Link
                href={`/results/${application.analysis.id}`}
                onClick={onClose}
                className="flex items-center gap-1 font-medium text-accent hover:underline"
              >
                <IconBolt size={14} stroke={1.5} />
                {application.analysis.matchScore}% — View analysis
              </Link>
            ) : (
              <span className="text-muted">None</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
