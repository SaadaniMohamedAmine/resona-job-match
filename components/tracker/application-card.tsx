"use client";

import { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  IconSend,
  IconUsers,
  IconCircleCheck,
  IconEyeOff,
  IconBolt,
  IconCalendar,
  IconTrash,
} from "@tabler/icons-react";
import type { Application } from "@/lib/hooks/use-applications";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ApplicationDetailModal } from "@/components/tracker/application-detail-modal";

const STATUS_ICON = {
  APPLIED: IconSend,
  INTERVIEW: IconUsers,
  OFFER: IconCircleCheck,
  REJECTED: IconEyeOff,
} as const;

export function ApplicationCard({
  application,
  onSetInterviewDate,
  onDelete,
}: {
  application: Application;
  onSetInterviewDate: (id: string, interviewAt: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });
  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [dateValue, setDateValue] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const style = transform
    ? { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }
    : undefined;

  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("[data-no-dnd]")) {
      pointerDownPos.current = null;
      return;
    }
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
    listeners?.onPointerDown?.(e);
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const start = pointerDownPos.current;
    pointerDownPos.current = null;
    if (!start) return;
    const movedX = Math.abs(e.clientX - start.x);
    const movedY = Math.abs(e.clientY - start.y);
    if (movedX < 5 && movedY < 5) setDetailOpen(true);
  }

  const isOffer = application.status === "OFFER";
  const Icon = STATUS_ICON[application.status];

  function handleScheduleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dateValue) return;
    onSetInterviewDate(application.id, new Date(dateValue).toISOString());
    setSchedulingOpen(false);
    setDateValue("");
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    await onDelete(application.id);
    setDeleting(false);
    setDeleteConfirmOpen(false);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`flex cursor-grab flex-col gap-4 rounded-(--radius-card) border bg-track/10 p-5 transition-colors active:cursor-grabbing ${
          isOffer ? "border-accent/30" : "border-track hover:border-track/60 hover:bg-track/20"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col">
            <h3
              className={`truncate font-display text-base font-medium ${isOffer ? "text-accent" : "text-base-light"}`}
            >
              {application.company}
            </h3>
            <p className="truncate text-sm text-muted">{application.role}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full border ${
                isOffer ? "border-accent/30 bg-accent/10 text-accent" : "border-track text-muted"
              }`}
            >
              <Icon size={16} stroke={1.5} />
            </div>
            <button
              type="button"
              data-no-dnd
              onClick={() => setDeleteConfirmOpen(true)}
              aria-label="Delete application"
              className="text-muted transition-colors hover:text-accent"
            >
              <IconTrash size={16} stroke={1.5} />
            </button>
          </div>
        </div>

        {application.status === "INTERVIEW" &&
          (application.interviewAt ? (
            <div className="flex items-center gap-2 rounded-(--radius-control) border border-accent/20 bg-accent/5 px-3 py-2">
              <IconCalendar size={16} stroke={1.5} className="text-accent" />
              <span className="text-xs font-medium text-accent">
                {new Date(application.interviewAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ) : schedulingOpen ? (
            <form onSubmit={handleScheduleSubmit} data-no-dnd className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                autoFocus
                className="min-w-0 flex-1 rounded-(--radius-control) border border-track bg-transparent px-2 py-1.5 text-xs text-base-light focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-(--radius-control) bg-accent px-2.5 py-1.5 text-xs font-medium text-[var(--color-base)]"
              >
                Save
              </button>
            </form>
          ) : (
            <button
              type="button"
              data-no-dnd
              onClick={() => setSchedulingOpen(true)}
              className="flex items-center gap-2 self-start text-xs text-muted hover:text-accent"
            >
              <IconCalendar size={14} stroke={1.5} />
              Add interview date
            </button>
          ))}

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">
            {new Date(application.appliedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {application.analysis && (
            <div
              className={`flex items-center gap-1 rounded-(--radius-control) border px-2 py-1 ${
                isOffer
                  ? "border-accent/30 bg-accent text-[var(--color-base)]"
                  : "border-track bg-track/40 text-accent"
              }`}
            >
              <IconBolt size={13} stroke={1.5} />
              <span className="text-xs font-medium">{application.analysis.matchScore}%</span>
            </div>
          )}
        </div>
      </div>

      {detailOpen && (
        <ApplicationDetailModal application={application} onClose={() => setDetailOpen(false)} />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete this application?"
        description={`This will permanently remove ${application.company} — ${application.role} from your tracker. This can't be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmOpen(false)}
        confirming={deleting}
      />
    </>
  );
}
