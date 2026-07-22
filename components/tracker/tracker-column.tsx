import { useDroppable } from "@dnd-kit/core";
import { useTranslations } from "next-intl";
import { ApplicationCard } from "./application-card";
import type { Application, ApplicationStatus } from "@/lib/hooks/use-applications";

export function TrackerColumn({
  status,
  applications,
  onSetInterviewDate,
  onDelete,
}: {
  status: ApplicationStatus;
  applications: Application[];
  onSetInterviewDate: (id: string, interviewAt: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const t = useTranslations("tracker");
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const isRejected = status === "REJECTED";

  const COLUMN_LABELS: Record<ApplicationStatus, string> = {
    APPLIED: t("columnApplied"),
    INTERVIEW: t("columnInterview"),
    OFFER: t("columnOffer"),
    REJECTED: t("columnRejected"),
  };

  return (
    <div className="flex min-h-[calc(100vh-320px)] flex-col gap-4">
      <div className="flex items-center justify-between border-b border-track px-2 pb-2">
        <span className="text-xs tracking-widest text-muted uppercase">{COLUMN_LABELS[status]}</span>
        <span className="rounded border border-track bg-track/40 px-2 py-0.5 text-[10px] text-muted">
          {applications.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-1 flex-col gap-4 rounded-(--radius-card) p-1 transition-all ${
          isOver ? "bg-accent/5" : ""
        } ${isRejected ? "opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0" : ""}`}
      >
        {applications.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            onSetInterviewDate={onSetInterviewDate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
